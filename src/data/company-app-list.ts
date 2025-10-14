import { Permission } from "@/lib/auth";
import { LinkProps } from "@tanstack/react-router";
import { ClipboardClock, UserRound } from "lucide-react";
import { createElement } from "react";

type CompanyApp = {
    name: string;
    description: string;
    icon: React.ReactNode;
    version?: string;
    appUrl: LinkProps;
    changelogUrl: LinkProps;
    requiredPermission: Permission | null;
};

export const appList: Array<CompanyApp> = [
    {
        name: "Employee Portal",
        description: "View your data, forms, documents, etc.",
        icon: createElement(UserRound),
        version: "0.1.0",
        appUrl: { to: "/employee-portal" },
        changelogUrl: { to: "/employee-portal/changelog" },
        requiredPermission: null,
    },
    {
        name: "Timesheets",
        description: "Manage attendance and paid time off for employees.",
        icon: createElement(ClipboardClock),
        version: "0.1.0",
        appUrl: { to: "/timesheets" },
        changelogUrl: { to: "/timesheets/changelog" },
        requiredPermission: "timesheet_functions",
    },
];
