import { ModeToggle } from "@/components/ui/theme-switch";

export default function BillingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative w-full h-full ">
            <div className="fixed top-5 right-5 " >
                <ModeToggle />
            </div>
            {children}
        </div>
    );
}