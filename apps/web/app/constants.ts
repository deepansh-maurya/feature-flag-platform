
export enum AppConst {
    appName = "Flagly",
    curPro = "currentProject"
}
export const getPrefix = () => {

    console.log(typeof window === "undefined");
    

    if (typeof window === "undefined") return "projects/0"; 
    return `projects/${sessionStorage.getItem(AppConst.curPro) ?? 0}`;
};

export const Routes = {
    Analytics: () => `/dashboard/analytics`,
    Environment: () => `/dashboard/env`,
    Featureflag: () => `/dashboard/feature-flag`,
    Rules: () => `/dashboard/rules`,
    SdkKeys: () => `/dashboard/sdk-keys`,
    AuditLogs: () => `/dashboard/audit-logs`,
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
