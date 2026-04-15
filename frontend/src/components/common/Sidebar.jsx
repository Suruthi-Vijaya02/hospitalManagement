"use client";

import Link from "next/link";
import useAuthStore from "@/store/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { 
    Users, 
    CreditCard, 
    Stethoscope, 
    Beaker, 
    ShoppingBag, 
    Package, 
    LogOut,
    Activity,
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const iconMap = {
    Patients: Users,
    Billing: CreditCard,
    Consultation: Stethoscope,
    Lab: Beaker,
    Pharmacy: ShoppingBag,
    Inventory: Package,
    "Admin Terminal": Shield
};

function NavItem({ item, isActive, Icon }) {
    return (
        <Link href={item.path} className="block">
            <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${isActive ? "" : "text-muted-foreground hover:text-foreground"}`}
            >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
            </Button>
        </Link>
    );
}

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const role = user?.role;

    const menu = {
        Receptionist: [
            { name: "Patients", path: "/dashboard/patients" },
            { name: "Billing", path: "/dashboard/billing" },
        ],
        Doctor: [
            { name: "Consultation", path: "/dashboard/consultations" },
        ],
        Lab: [
            { name: "Lab", path: "/dashboard/lab" },
        ],
        Pharmacist: [
            { name: "Pharmacy", path: "/dashboard/pharmacy" },
            { name: "Inventory", path: "/dashboard/inventory" },
        ],
        Admin: [
            { name: "Admin Terminal", path: "/dashboard/admin" },
        ],
    };

    return (
        <div className="w-72 h-full flex flex-col bg-background border-r">
            {/* Logo Section */}
            <div className="p-6 border-b flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold tracking-tight">HMS Core</span>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <h4 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Management
                    </h4>
                    <div className="space-y-1">
                        {menu[role]?.map((item) => {
                            const Icon = iconMap[item.name] || Activity;
                            const isActive = pathname === item.path;
                            return (
                                <NavItem 
                                    key={item.path} 
                                    item={item} 
                                    isActive={isActive} 
                                    Icon={Icon} 
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* User Profile & Logout */}
            <div className="p-4 border-t space-y-4">
                <Card className="p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                    </div>
                </Card>
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                </Button>
            </div>
        </div>
    );
}