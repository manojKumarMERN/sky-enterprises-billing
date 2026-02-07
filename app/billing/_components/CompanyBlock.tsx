"use client";

import { Card, CardContent } from "@/components/ui/card";
import { COMPANY_INFO } from "@/shared/constants/company";

export default function CompanyBlock() {
    const date = new Date().toLocaleDateString();
    const day = new Date().toLocaleString("en-IN", { weekday: "long" });

    return (
        <Card>
            <CardContent className="flex flex-col md:flex-row justify-between p-6 gap-4">

                <div className="flex justify-start gap-3" >
                    <div className="flex justify-center items-center" >
                    <img src="/logo.png" alt="logo" className="h-20" />

                    </div>
                    <div className="flex flex-col justify-center" >
                    <h1 className="text-2xl font-bold">{COMPANY_INFO?.companyName}</h1>
                    <p className="text-sm text-muted-foreground italic ">{COMPANY_INFO?.tagLine}</p>
                    <p className="text-sm text-muted-foreground">{COMPANY_INFO?.officeLocation}</p>

                    </div>
                </div>

                <div className="text-sm text-right">
                    <p>Date: {date}</p>
                    <p>Day: {day}</p>
                </div>

            </CardContent>
        </Card>
    );
}
