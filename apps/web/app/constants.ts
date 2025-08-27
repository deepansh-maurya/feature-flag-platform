
export enum AppConst {
    appName = "Flagly",
    curPro = "currentProject"
}
export const getPrefix = () => {
    if (typeof window === "undefined") return "projects/0"; // fallback for SSR
    return `projects/${sessionStorage.getItem(AppConst.curPro) ?? 0}`;
};

export const Routes = {
    Analytics: () => `/dashboard/${getPrefix()}/analytics`,
    Environment: () => `/dashboard/${getPrefix()}/env`,
    Featureflag: () => `/dashboard/${getPrefix()}/feature-flag`,
    Rules: () => `/dashboard/${getPrefix()}/rules`,
    SdkKeys: () => `/dashboard/${getPrefix()}/sdk-keys`,
    AuditLogs: () => `/dashboard/${getPrefix()}/audit-logs`,
    Projects: () => "/dashboard/projects",
    Team: () => "/dashboard/team",
    Account: () => "/dashboard/account",
    Billing: () => "/dashboard/billing",
    pricing: () => "/pricing",
    signup: () => "/register",
    login: () => "/login",
    landingPage: () => "/",
    dashboard: () => "/dashboard"
};
