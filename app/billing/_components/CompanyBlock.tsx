"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function CompanyBlock() {
    const date = new Date().toLocaleDateString();
    const day = new Date().toLocaleString("en-IN", { weekday: "long" });

    return (
        <Card>
            <CardContent className="flex flex-col md:flex-row justify-between p-6 gap-4">

                <div>
                    <h1 className="text-2xl font-bold">SKY Enterprises and Decors</h1>
                    <p className="text-sm text-muted-foreground">Tiruchengode</p>
                </div>

                <div className="text-sm text-right">
                    <p>Date: {date}</p>
                    <p>Day: {day}</p>
                </div>

            </CardContent>
        </Card>
    );
}
