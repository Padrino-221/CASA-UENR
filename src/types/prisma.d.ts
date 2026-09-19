declare module '@prisma/client' {
  export class PrismaClient {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $on(event: string, callback: (event: any) => void): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $use(params: any): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction<T>(fn: (prisma: any) => Promise<T>, options?: any): Promise<T>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    region: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapter: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    academicYear: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    semester: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    student: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attendanceSession: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attendanceRecord: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventRSVP: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    auditLog: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    siteContent: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mediaAsset: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    siteArticle: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    siteEvent: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    siteLeader: any;
  }
  export type Role =
    | 'NATIONAL_ADMIN'
    | 'REGIONAL_ADMIN'
    | 'LOCAL_ADMIN'
    | 'CONTENT_MANAGER'
    | 'FINANCE'
    | 'SECRETARY';
}
