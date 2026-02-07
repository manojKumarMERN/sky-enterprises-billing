export default function InvoiceTemplate({ data }: any) {
    const today = new Date();
    const date = today.toLocaleDateString();
    const day = today.toLocaleString("en-IN", { weekday: "long" });

    const total = data.items.reduce(
        (sum: number, item: any) => sum + item.qty * item.price,
        0
    );

    return (
        <div id="invoice-preview" className="max-w-4xl mx-auto bg-white text-black shadow-xl p-10 border print:shadow-none print:border-0">

            {/* ===== HEADER BAR ===== */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="logo" className="h-16" />
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">{data.company}</h1>
                        <span className="text-sm text-gray-600" >{data.tagLine}</span>
                        <p className="text-sm text-gray-600">{data.location}</p>
                        <span className="text-sm text-gray-600" >Phone: {data.phone}</span>
                    </div>
                </div>

                {/* Date */}
                <div className="text-right text-sm">
                    <p><span className="font-semibold">Date:</span> {date}</p>
                    <p><span className="font-semibold">Day:</span> {day}</p>
                </div>
            </div>

            {/* ===== CLIENT DETAILS BOX ===== */}
            <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-lg mb-2">Bill To</h2>
                <p><span className="font-medium">Name:</span> {data.client.name}</p>
                <p><span className="font-medium">Address:</span> {data.client.address}</p>
            </div>

            {/* ===== ITEMS TABLE ===== */}
            <table className="w-full text-sm border border-collapse rounded-lg overflow-hidden">
                <thead className="bg-black text-white">
                    <tr>
                        <th className="p-2 border">S.No</th>
                        <th className="p-2 border">Product / Description</th>
                        <th className="p-2 border text-center">Qty</th>
                        <th className="p-2 border text-right">Price (₹)</th>
                        <th className="p-2 border text-right">Total (₹)</th>
                    </tr>
                </thead>

                <tbody>
                    {data.items.map((item: any, index: number) => (
                        <tr key={index} className="odd:bg-gray-50">
                            <td className="border p-2 text-center">{index + 1}</td>
                            <td className="border p-2 font-medium">{item.name}</td>
                            <td className="border p-2 text-center">{item.qty}</td>
                            <td className="border p-2 text-right">₹{item.price}</td>
                            <td className="border p-2 text-right font-semibold">
                                ₹{item.qty * item.price}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ===== TOTAL BOX ===== */}
            <div className="flex justify-end mt-6">
                <div className="bg-black text-white px-6 py-3 rounded-lg text-lg font-bold">
                    Grand Total: ₹{total}
                </div>
            </div>

            {/* ===== SIGNATURE SECTION ===== */}
            <div className="flex justify-between mt-12 text-sm">
                <div>
                    <p className="font-medium">Customer Signature</p>
                    <div className="border-t w-40 mt-6"></div>
                </div>

                <div className="text-right">
                    <p className="font-medium">For {data.company}</p>
                    <div className="border-t w-40 mt-6 ml-auto"></div>
                    <p className="text-xs text-gray-600 mt-1">Authorized Signatory</p>
                </div>
            </div>
        </div>
    );
}
