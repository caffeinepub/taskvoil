import Time "mo:core/Time";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import EmailClient "email/emailClient";
import VerifiedEmails "email-verification/verifiedEmails";
import MixinEmailVerification "email-verification/verificationMixin";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let verifiedEmailsState = VerifiedEmails.new();
  include MixinEmailVerification(verifiedEmailsState);

  // ===== Stripe Configuration =====
  let stripeConfig : Stripe.StripeConfiguration = {
    secretKey = "sk_test_51RYWXvH8ORT1N7BcnE4m98faq3Ex0Wmal4gV75xnKqRNWvYYSsCRD0e3Bbzp2trPabKD8bygSkqbdu7K02irkxcu00m7F8qttE";
    allowedCountries = ["FR", "BE", "GB", "IE", "DE", "ES", "IT", "PT", "GR", "CH", "NL", "LU"];
  };

  public query func transformResponse(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createStripeCheckout(
    amountInCents : Nat,
    title : Text,
    description : Text,
    successUrl : Text,
    cancelUrl : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create a checkout session");
    };
    let items : [Stripe.ShoppingItem] = [{
      currency = "eur";
      productName = title;
      productDescription = description;
      priceInCents = amountInCents;
      quantity = 1;
    }];
    await Stripe.createCheckoutSession(stripeConfig, caller, items, successUrl, cancelUrl, transformResponse);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let status = await Stripe.getSessionStatus(stripeConfig, sessionId, transformResponse);
    switch (status) {
      case (#completed({ response; userPrincipal = _ })) { response };
      case (#failed({ error })) { Runtime.trap("Stripe session error: " # error) };
    };
  };

  var nextUserId = 0;
  var nextDocumentId = 0;

  // ===== User types =====

  module User {
    public type Role = { #client; #pro; #admin };

    public type Status = {
      #active;
      #suspended;
      #pending;
      #verified;
      #rejected;
    };

    public type User = {
      id : Nat;
      principal : Principal;
      role : Role;
      email : Text;
      firstName : Text;
      lastName : Text;
      country : Text;
      language : Text;
      createdAt : Int;
      status : Status;
    };

    public type PublicUser = {
      id : Nat;
      role : Role;
      email : Text;
      firstName : Text;
      lastName : Text;
      country : Text;
      language : Text;
      createdAt : Int;
      status : Status;
      emailVerified : Bool;
    };
  };

  module ProProfile {
    public type Category = {
      #plomberie;
      #electricite;
      #menage;
      #jardinage;
      #bricolage;
      #demenagement;
      #babySitting;
      #peinture;
      #maconnerie;
      #informatique;
      #cours;
      #cuisine;
    };

    public type Profile = {
      userId : Nat;
      companyName : Text;
      category : Category;
      city : Text;
      postalCode : Text;
      radius : Nat;
      description : Text;
      hourlyRate : Nat;
      isVerified : Bool;
      status : User.Status;
      rating : Float;
      totalMissions : Nat;
      isPremium : Bool;
      businessId : Text;
      businessIdType : Text;
      country : Text;
    };
  };

  module Document {
    public type DocType = {
      #devis;
      #bonPourAccord;
      #facture;
    };

    public type Status = {
      #draft;
      #sent;
      #signed;
      #archived;
    };

    public type Document = {
      id : Nat;
      missionId : Nat;
      docType : DocType;
      status : Status;
      clientId : Nat;
      proId : Nat;
      amount : Nat;
      vatRate : Nat;
      description : Text;
      createdAt : Int;
      signedAt : ?Int;
      signatureHash : ?Text;
      signerPrincipal : ?Principal;
    };
  };

  // Stable variables
  let users = Map.empty<Nat, User.User>();
  let proProfiles = Map.empty<Nat, ProProfile.Profile>();
  let activeVerifications = Set.empty<Nat>();
  let documents = Map.empty<Nat, Document.Document>();

  // Auth stable variables
  let userPasswords = Map.empty<Nat, Text>();  // userId -> passwordHash
  let emailVerifiedSet = Set.empty<Text>();    // set of verified email addresses

  // ===== Auth helpers =====

  func isVerified(email : Text) : Bool {
    emailVerifiedSet.contains(email) or VerifiedEmails.contains(verifiedEmailsState, email);
  };

  func toPublicUser(user : User.User) : User.PublicUser {
    {
      id = user.id;
      role = user.role;
      email = user.email;
      firstName = user.firstName;
      lastName = user.lastName;
      country = user.country;
      language = user.language;
      createdAt = user.createdAt;
      status = user.status;
      emailVerified = isVerified(user.email);
    };
  };

  // ===== Registration with email verification =====

  public shared func registerUser(
    role : User.Role,
    email : Text,
    firstName : Text,
    lastName : Text,
    country : Text,
    language : Text,
    passwordHash : Text,
  ) : async User.PublicUser {
    if (role == #admin) {
      Runtime.trap("Cannot register as admin directly");
    };

    // Check for duplicate email
    let existingUser = users.values().find(func(u) { u.email == email });
    switch (existingUser) {
      case (?_) { Runtime.trap("An account with this email already exists") };
      case null {};
    };

    let id = nextUserId;
    nextUserId += 1;

    let user : User.User = {
      id;
      principal = Principal.fromText("2vxsx-fae");
      role;
      email;
      firstName;
      lastName;
      country;
      language;
      createdAt = Time.now();
      status = #pending;
    };

    users.add(id, user);
    userPasswords.add(id, passwordHash);

    // Send verification email via Caffeine managed infrastructure
    let verifyUrl = "{{VERIFICATION_URL}}";
    let htmlBody = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;'>"
      # "<div style='text-align:center;margin-bottom:24px;'>"
      # "<h1 style='color:#d97706;font-size:28px;margin:0;'>TaskVoil\u{E0}</h1>"
      # "<p style='color:#666;margin:4px 0 0;font-size:14px;'>La marketplace de services locaux</p>"
      # "</div>"
      # "<h2 style='color:#1a1a1a;font-size:20px;'>Bonjour " # firstName # ",</h2>"
      # "<p style='color:#444;line-height:1.6;'>Merci de rejoindre TaskVoil\u{E0} ! Pour activer votre compte et commencer \u{E0} utiliser la plateforme, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.</p>"
      # "<div style='text-align:center;margin:32px 0;'>"
      # "<a href='" # verifyUrl # "' style='display:inline-block;background:#d97706;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;'>Confirmer mon adresse email</a>"
      # "</div>"
      # "<p style='color:#666;font-size:14px;line-height:1.6;'>Si vous n'avez pas cr\u{E9}\u{E9} de compte sur TaskVoil\u{E0}, ignorez cet email. Votre adresse ne sera pas utilis\u{E9}e.</p>"
      # "<hr style='border:none;border-top:1px solid #eee;margin:24px 0;'/>"
      # "<p style='color:#999;font-size:12px;text-align:center;'>\u{A9} 2026 TaskVoil\u{E0} &bull; Tous droits r\u{E9}serv\u{E9}s</p>"
      # "</div>";

    ignore await EmailClient.sendVerificationEmail(
      "taskvoila",
      [email],
      "Confirmez votre adresse email - TaskVoil\u{E0}",
      htmlBody,
    );

    toPublicUser(user);
  };

  // ===== Resend verification email =====
  public shared func resendVerificationEmail(email : Text) : async Bool {
    let userOpt = users.values().find(func(u) { u.email == email });
    switch (userOpt) {
      case null { false };
      case (?user) {
        if (isVerified(email)) { return false };
        let verifyUrl = "{{VERIFICATION_URL}}";
        let htmlBody = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;'>"
          # "<h1 style='color:#d97706;'>TaskVoil\u{E0}</h1>"
          # "<h2>Bonjour " # user.firstName # ",</h2>"
          # "<p>Voici un nouveau lien pour confirmer votre adresse email.</p>"
          # "<div style='text-align:center;margin:32px 0;'>"
          # "<a href='" # verifyUrl # "' style='display:inline-block;background:#d97706;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;'>Confirmer mon adresse email</a>"
          # "</div>"
          # "<p style='color:#666;font-size:14px;'>Si vous n'avez pas cr\u{E9}\u{E9} ce compte, ignorez cet email.</p>"
          # "</div>";
        ignore await EmailClient.sendVerificationEmail(
          "taskvoila",
          [email],
          "Confirmez votre adresse email - TaskVoil\u{E0}",
          htmlBody,
        );
        true
      };
    };
  };

  // ===== Request password reset =====
  public shared func requestPasswordReset(email : Text) : async Bool {
    let userOpt = users.values().find(func(u) { u.email == email });
    switch (userOpt) {
      case null { false };
      case (?user) {
        let resetUrl = "https://taskvoila.app/reset-password";
        let htmlBody = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;'>"
          # "<h1 style='color:#d97706;'>TaskVoil\u{E0}</h1>"
          # "<h2>Bonjour " # user.firstName # ",</h2>"
          # "<p>Vous avez demand\u{E9} la r\u{E9}initialisation de votre mot de passe TaskVoil\u{E0}.</p>"
          # "<div style='text-align:center;margin:32px 0;'>"
          # "<a href='" # resetUrl # "?email=" # email # "' style='display:inline-block;background:#d97706;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;'>R\u{E9}initialiser mon mot de passe</a>"
          # "</div>"
          # "<p style='color:#666;font-size:14px;'>Ce lien expire dans 15 minutes. Si vous n'avez pas fait cette demande, ignorez cet email.</p>"
          # "<hr style='border:none;border-top:1px solid #eee;margin:24px 0;'/>"
          # "<p style='color:#999;font-size:12px;text-align:center;'>\u{A9} 2026 TaskVoil\u{E0}</p>"
          # "</div>";
        ignore await EmailClient.sendVerificationEmail(
          "taskvoila",
          [email],
          "R\u{E9}initialisation de mot de passe - TaskVoil\u{E0}",
          htmlBody,
        );
        true
      };
    };
  };

  // Mark user as verified
  public shared func markEmailVerified(email : Text) : async Bool {
    let isAlreadyVerified = isVerified(email);
    if (isAlreadyVerified) {
      let userOpt = users.values().find(func(u) { u.email == email });
      switch (userOpt) {
        case (?user) {
          if (user.status == #pending) {
            let updatedUser : User.User = { user with status = #verified };
            users.add(user.id, updatedUser);
          };
          true;
        };
        case null { false };
      };
    } else {
      emailVerifiedSet.add(email);
      let userOpt = users.values().find(func(u) { u.email == email });
      switch (userOpt) {
        case (?user) {
          let updatedUser : User.User = { user with status = #verified };
          users.add(user.id, updatedUser);
          true;
        };
        case null { false };
      };
    };
  };

  // Check if email is verified
  public query func isEmailVerified(email : Text) : async Bool {
    isVerified(email);
  };

  // ===== Login =====

  public query func loginUser(email : Text, passwordHash : Text) : async ?User.PublicUser {
    let userOpt = users.values().find(func(u) { u.email == email });
    switch (userOpt) {
      case (?user) {
        // User must have verified email to log in
        if (not isVerified(user.email) and user.status == #pending) {
          return null;
        };
        let storedHashOpt = userPasswords.get(user.id);
        let hashMatch = switch (storedHashOpt) {
          case (?storedHash) { storedHash == passwordHash };
          case null { false };
        };
        if (hashMatch) {
          ?toPublicUser(user);
        } else {
          null;
        };
      };
      case null { null };
    };
  };

  // ===== Legacy register (backward compatibility) =====

  public shared ({ caller }) func register(role : User.Role, email : Text, firstName : Text, lastName : Text, country : Text, language : Text) : async User.User {
    if (role == #admin) {
      Runtime.trap("Cannot register as admin directly");
    };

    let id = nextUserId;
    nextUserId += 1;

    let user : User.User = {
      id;
      principal = caller;
      role;
      email;
      firstName;
      lastName;
      country;
      language;
      createdAt = 0;
      status = #active;
    };

    users.add(id, user);
    user;
  };

  public query ({ caller }) func getMyProfile() : async User.PublicUser {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };

    let userOpt = users.values().find(func(u) { u.principal == caller });
    switch (userOpt) {
      case (?user) { toPublicUser(user) };
      case null { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func updateProfile(userId : Nat, email : Text, firstName : Text, lastName : Text, country : Text, language : Text) : async () {
    let userOpt = users.get(userId);
    let user = switch (userOpt) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };

    if (user.principal != caller) {
      Runtime.trap("Unauthorized: Can only update your own profile");
    };

    let updatedUser : User.User = {
      user with
      email;
      firstName;
      lastName;
      country;
      language;
    };

    users.add(userId, updatedUser);
  };

  public query ({ caller }) func getUserById(userId : Nat) : async User.User {
    let userOpt = users.get(userId);
    let user = switch (userOpt) {
      case (?u) { u };
      case null { Runtime.trap("User not found") };
    };

    if (caller != user.principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    user;
  };

  public query ({ caller }) func listUsers() : async [User.User] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list users");
    };
    users.values().toArray();
  };

  func compareUsersByLastName(u1 : User.User, u2 : User.User) : Order.Order {
    Text.compare(u1.lastName, u2.lastName);
  };

  public query ({ caller }) func filteredUsersSortedByLastName(roleFilter : User.Role) : async [User.User] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can filter users");
    };

    users.values().toArray().filter(func(u) { u.role == roleFilter }).sort(compareUsersByLastName);
  };

  // === Helper Functions ===

  func getUserIdByCaller(caller : Principal) : ?Nat {
    let userOpt = users.values().find(func(u) { u.principal == caller });
    switch (userOpt) {
      case (?user) { ?user.id };
      case null { null };
    };
  };

  func getPrincipalByUserId(userId : Nat) : ?Principal {
    let userOpt = users.get(userId);
    switch (userOpt) {
      case (?u) { ?u.principal };
      case null { null };
    };
  };

  func isDocumentParticipant(caller : Principal, doc : Document.Document) : Bool {
    let callerUserIdOpt = getUserIdByCaller(caller);
    switch (callerUserIdOpt) {
      case (?callerUserId) {
        callerUserId == doc.clientId or callerUserId == doc.proId
      };
      case null { false };
    };
  };

  func generateSignatureHash(documentId : Nat) : Text {
    let hashText = "doc_" # documentId.toText() # "_signature";
    hashText;
  };

  // === Document Management ===

  public shared ({ caller }) func createDocument(
    missionId : Nat,
    docType : Document.DocType,
    clientId : Nat,
    proId : Nat,
    amount : Nat,
    vatRate : Nat,
    description : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create documents");
    };

    let callerUserIdOpt = getUserIdByCaller(caller);
    let callerUserId = switch (callerUserIdOpt) {
      case (?id) { id };
      case null { Runtime.trap("Caller is not a registered user") };
    };

    if (callerUserId != clientId and callerUserId != proId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create documents for missions you are involved in");
    };

    let clientExists = users.get(clientId);
    let proExists = users.get(proId);
    if (clientExists == null) {
      Runtime.trap("Client user does not exist");
    };
    if (proExists == null) {
      Runtime.trap("Pro user does not exist");
    };

    let documentId = nextDocumentId;
    nextDocumentId += 1;

    let newDoc : Document.Document = {
      id = documentId;
      missionId;
      docType;
      status = #draft;
      clientId;
      proId;
      amount;
      vatRate;
      description;
      createdAt = Time.now();
      signedAt = null;
      signatureHash = null;
      signerPrincipal = null;
    };

    documents.add(documentId, newDoc);
    documentId;
  };

  public query ({ caller }) func getDocument(documentId : Nat) : async Document.Document {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view documents");
    };

    let docOpt = documents.get(documentId);
    let doc = switch (docOpt) {
      case (?d) { d };
      case null { Runtime.trap("Document not found") };
    };

    if (not isDocumentParticipant(caller, doc) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view documents you are involved in");
    };

    doc;
  };

  public query ({ caller }) func listDocumentsByMission(missionId : Nat) : async [Document.Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list documents");
    };

    let callerUserIdOpt = getUserIdByCaller(caller);
    let callerUserId = switch (callerUserIdOpt) {
      case (?id) { id };
      case null { Runtime.trap("Caller is not a registered user") };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let result = List.empty<Document.Document>();
    for ((_, doc) in documents.entries()) {
      if (doc.missionId == missionId) {
        if (isAdmin or doc.clientId == callerUserId or doc.proId == callerUserId) {
          result.add(doc);
        };
      };
    };
    result.toArray();
  };

  public query ({ caller }) func listDocumentsByUser(userId : Nat) : async [Document.Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list documents");
    };

    let callerUserIdOpt = getUserIdByCaller(caller);
    let callerUserId = switch (callerUserIdOpt) {
      case (?id) { id };
      case null { Runtime.trap("Caller is not a registered user") };
    };

    if (callerUserId != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only list your own documents");
    };

    let result = List.empty<Document.Document>();
    for ((_, doc) in documents.entries()) {
      if (doc.clientId == userId or doc.proId == userId) {
        result.add(doc);
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func signDocument(documentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can sign documents");
    };

    let docOpt = documents.get(documentId);
    let doc = switch (docOpt) {
      case (?d) { d };
      case null { Runtime.trap("Document not found") };
    };

    if (not isDocumentParticipant(caller, doc) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only sign documents you are involved in");
    };

    if (doc.status == #signed) {
      Runtime.trap("Document is already signed");
    };

    let updatedDoc : Document.Document = {
      doc with
      status = #signed;
      signedAt = ?Time.now();
      signatureHash = ?generateSignatureHash(documentId);
      signerPrincipal = ?caller;
    };

    documents.add(documentId, updatedDoc);
  };
  // ===== MISSIONS =====

  var nextMissionId = 0;
  var nextOfferId = 0;
  var nextRentalId = 0;

  module Mission {
    public type Status = { #open; #in_progress; #completed; #cancelled };

    public type Mission = {
      id : Nat;
      authorId : Nat;
      title : Text;
      description : Text;
      category : Text;
      subcategory : Text;
      city : Text;
      country : Text;
      budgetMin : Nat;
      budgetMax : Nat;
      scheduledDate : ?Text;
      status : Status;
      createdAt : Int;
      acceptedOfferId : ?Nat;
    };
  };

  module Offer {
    public type Status = { #pending; #accepted; #rejected; #withdrawn };

    public type Offer = {
      id : Nat;
      missionId : Nat;
      proId : Nat;
      price : Nat;
      description : Text;
      timeline : Text;
      status : Status;
      createdAt : Int;
    };
  };

  module Rental {
    public type Status = { #active; #inactive; #deleted };

    public type Listing = {
      id : Nat;
      ownerId : Nat;
      title : Text;
      description : Text;
      categoryId : Text;
      subcategoryId : Text;
      pricePerDay : Nat;
      pricePerHalfDay : Nat;
      deposit : Nat;
      city : Text;
      country : Text;
      condition : Text;
      deliveryAvailable : Bool;
      deliveryPrice : Nat;
      brand : ?Text;
      model : ?Text;
      status : Status;
      createdAt : Int;
    };
  };

  let missions = Map.empty<Nat, Mission.Mission>();
  let offers = Map.empty<Nat, Offer.Offer>();
  let rentalListings = Map.empty<Nat, Rental.Listing>();

  // ===== Mission CRUD =====

  public shared ({ caller }) func createMission(
    title : Text,
    description : Text,
    category : Text,
    subcategory : Text,
    city : Text,
    country : Text,
    budgetMin : Nat,
    budgetMax : Nat,
    scheduledDate : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let authorIdOpt = getUserIdByCaller(caller);
    let authorId = switch (authorIdOpt) {
      case (?id) { id };
      case null { Runtime.trap("User not found") };
    };
    let id = nextMissionId;
    nextMissionId += 1;
    let m : Mission.Mission = {
      id; authorId; title; description; category; subcategory;
      city; country; budgetMin; budgetMax; scheduledDate;
      status = #open; createdAt = Time.now(); acceptedOfferId = null;
    };
    missions.add(id, m);
    id
  };

  public query func getMission(id : Nat) : async Mission.Mission {
    switch (missions.get(id)) {
      case (?m) { m };
      case null { Runtime.trap("Mission not found") };
    };
  };

  public query func listMissions(country : Text, category : Text) : async [Mission.Mission] {
    missions.values().toArray().filter(func(m) {
      let matchCountry = country == "" or m.country == country;
      let matchCat = category == "" or m.category == category;
      matchCountry and matchCat and m.status == #open
    });
  };

  public query ({ caller }) func listMissionsByUser() : async [Mission.Mission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let userIdOpt = getUserIdByCaller(caller);
    switch (userIdOpt) {
      case (?uid) { missions.values().toArray().filter(func(m) { m.authorId == uid }) };
      case null { [] };
    };
  };

  public shared ({ caller }) func updateMissionStatus(id : Nat, newStatus : Mission.Status) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let m = switch (missions.get(id)) {
      case (?x) { x };
      case null { Runtime.trap("Mission not found") };
    };
    let userIdOpt = getUserIdByCaller(caller);
    let isOwner = switch (userIdOpt) {
      case (?uid) { uid == m.authorId };
      case null { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    missions.add(id, { m with status = newStatus });
  };

  public shared ({ caller }) func deleteMission(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let m = switch (missions.get(id)) {
      case (?x) { x };
      case null { Runtime.trap("Mission not found") };
    };
    let userIdOpt = getUserIdByCaller(caller);
    let isOwner = switch (userIdOpt) {
      case (?uid) { uid == m.authorId };
      case null { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    missions.add(id, { m with status = #cancelled });
  };

  // ===== Offer CRUD =====

  public shared ({ caller }) func submitOffer(
    missionId : Nat,
    price : Nat,
    description : Text,
    timeline : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let proIdOpt = getUserIdByCaller(caller);
    let proId = switch (proIdOpt) {
      case (?id) { id };
      case null { Runtime.trap("User not found") };
    };
    let id = nextOfferId;
    nextOfferId += 1;
    let o : Offer.Offer = {
      id; missionId; proId; price; description; timeline;
      status = #pending; createdAt = Time.now();
    };
    offers.add(id, o);
    id
  };

  public query ({ caller }) func listOffersByMission(missionId : Nat) : async [Offer.Offer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    offers.values().toArray().filter(func(o) { o.missionId == missionId })
  };

  public shared ({ caller }) func acceptOffer(offerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let offer = switch (offers.get(offerId)) {
      case (?o) { o };
      case null { Runtime.trap("Offer not found") };
    };
    let mission = switch (missions.get(offer.missionId)) {
      case (?m) { m };
      case null { Runtime.trap("Mission not found") };
    };
    let userIdOpt = getUserIdByCaller(caller);
    let isOwner = switch (userIdOpt) {
      case (?uid) { uid == mission.authorId };
      case null { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    offers.add(offerId, { offer with status = #accepted });
    missions.add(mission.id, { mission with status = #in_progress; acceptedOfferId = ?offerId });
    // Reject all other offers
    for ((oid, o) in offers.entries()) {
      if (o.missionId == offer.missionId and oid != offerId and o.status == #pending) {
        offers.add(oid, { o with status = #rejected });
      };
    };
  };

  public shared ({ caller }) func rejectOffer(offerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let offer = switch (offers.get(offerId)) {
      case (?o) { o };
      case null { Runtime.trap("Offer not found") };
    };
    let mission = switch (missions.get(offer.missionId)) {
      case (?m) { m };
      case null { Runtime.trap("Mission not found") };
    };
    let userIdOpt = getUserIdByCaller(caller);
    let isOwner = switch (userIdOpt) {
      case (?uid) { uid == mission.authorId };
      case null { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    offers.add(offerId, { offer with status = #rejected });
  };

  // ===== Rental Listings =====

  public shared ({ caller }) func createRentalListing(
    title : Text,
    description : Text,
    categoryId : Text,
    subcategoryId : Text,
    pricePerDay : Nat,
    pricePerHalfDay : Nat,
    deposit : Nat,
    city : Text,
    country : Text,
    condition : Text,
    deliveryAvailable : Bool,
    deliveryPrice : Nat,
    brand : ?Text,
    model : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let ownerIdOpt = getUserIdByCaller(caller);
    let ownerId = switch (ownerIdOpt) {
      case (?id) { id };
      case null { Runtime.trap("User not found") };
    };
    let id = nextRentalId;
    nextRentalId += 1;
    let l : Rental.Listing = {
      id; ownerId; title; description; categoryId; subcategoryId;
      pricePerDay; pricePerHalfDay; deposit; city; country; condition;
      deliveryAvailable; deliveryPrice; brand; model;
      status = #active; createdAt = Time.now();
    };
    rentalListings.add(id, l);
    id
  };

  public query func getRentalListing(id : Nat) : async Rental.Listing {
    switch (rentalListings.get(id)) {
      case (?l) { l };
      case null { Runtime.trap("Rental listing not found") };
    };
  };

  public query func listRentalListings(country : Text, categoryId : Text) : async [Rental.Listing] {
    rentalListings.values().toArray().filter(func(l) {
      let matchCountry = country == "" or l.country == country;
      let matchCat = categoryId == "" or l.categoryId == categoryId;
      matchCountry and matchCat and l.status == #active
    });
  };

  public query ({ caller }) func listRentalListingsByOwner() : async [Rental.Listing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let ownerIdOpt = getUserIdByCaller(caller);
    switch (ownerIdOpt) {
      case (?uid) { rentalListings.values().toArray().filter(func(l) { l.ownerId == uid }) };
      case null { [] };
    };
  };

  public shared ({ caller }) func updateRentalListing(
    id : Nat,
    title : Text,
    description : Text,
    pricePerDay : Nat,
    pricePerHalfDay : Nat,
    deposit : Nat,
    city : Text,
    deliveryAvailable : Bool,
    deliveryPrice : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let l = switch (rentalListings.get(id)) {
      case (?x) { x };
      case null { Runtime.trap("Rental listing not found") };
    };
    let ownerIdOpt = getUserIdByCaller(caller);
    let isOwner = switch (ownerIdOpt) {
      case (?uid) { uid == l.ownerId };
      case null { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    rentalListings.add(id, {
      l with title; description; pricePerDay; pricePerHalfDay;
      deposit; city; deliveryAvailable; deliveryPrice;
    });
  };

  public shared ({ caller }) func deleteRentalListing(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let l = switch (rentalListings.get(id)) {
      case (?x) { x };
      case null { Runtime.trap("Rental listing not found") };
    };
    let ownerIdOpt = getUserIdByCaller(caller);
    let isOwner = switch (ownerIdOpt) {
      case (?uid) { uid == l.ownerId };
      case null { false };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    rentalListings.add(id, { l with status = #deleted });
  };

};
