"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useBillingStore } from "@/store/useBillingStore";

export default function DescriptionBlock() {
    const enabled = useBillingStore((s) => s.projectDescriptionEnabled);
    const description = useBillingStore((s) => s.projectDescription);
    const setEnabled = useBillingStore((s) => s.setProjectDescriptionEnabled);
    const setDescription = useBillingStore((s) => s.setProjectDescription);

    return (
        <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2">
                <Checkbox
                    checked={enabled}
                    onCheckedChange={(v) => setEnabled(Boolean(v))}
                />
                <p className="text-sm font-medium">Add Project Description</p>
            </div>

            {enabled && (
                <Textarea
                    className="mt-3"
                    placeholder="Enter project description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            )}
        </div>
    );
}
