import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface User {
    id: bigint;
    status: Status;
    principal: Principal;
    country: string;
    createdAt: bigint;
    role: Role;
    email: string;
    language: string;
    lastName: string;
    firstName: string;
}
export interface Document {
    id: bigint;
    status: Status__1;
    clientId: bigint;
    signerPrincipal?: Principal;
    createdAt: bigint;
    description: string;
    signedAt?: bigint;
    signatureHash?: string;
    missionId: bigint;
    proId: bigint;
    amount: bigint;
    docType: DocType;
    vatRate: bigint;
}
export enum DocType {
    bonPourAccord = "bonPourAccord",
    facture = "facture",
    devis = "devis"
}
export enum Role {
    pro = "pro",
    client = "client",
    admin = "admin"
}
export enum Status {
    verified = "verified",
    active = "active",
    pending = "pending",
    rejected = "rejected",
    suspended = "suspended"
}
export enum Status__1 {
    sent = "sent",
    signed = "signed",
    draft = "draft",
    archived = "archived"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDocument(missionId: bigint, docType: DocType, clientId: bigint, proId: bigint, amount: bigint, vatRate: bigint, description: string): Promise<bigint>;
    filteredUsersSortedByLastName(roleFilter: Role): Promise<Array<User>>;
    getCallerUserRole(): Promise<UserRole>;
    getDocument(documentId: bigint): Promise<Document>;
    getMyProfile(): Promise<User>;
    getUserById(userId: bigint): Promise<User>;
    isCallerAdmin(): Promise<boolean>;
    listDocumentsByMission(missionId: bigint): Promise<Array<Document>>;
    listDocumentsByUser(userId: bigint): Promise<Array<Document>>;
    listUsers(): Promise<Array<User>>;
    register(role: Role, email: string, firstName: string, lastName: string, country: string, language: string): Promise<User>;
    signDocument(documentId: bigint): Promise<void>;
    updateProfile(userId: bigint, email: string, firstName: string, lastName: string, country: string, language: string): Promise<void>;
}
