
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReceipt } from "../apis/receipts";
import type { Receipt } from "../interfaces/interfaces";
import "../styles/Receipt.css";

function ReceiptPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchReceipt() {
            try {
                if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
                    throw new Error("Invalid receipt ID.");
                }

                const data = await getReceipt(Number(id));

                if (!cancelled) {
                    setReceipt(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load receipt."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchReceipt();

        return () => {
            cancelled = true;
        };
    }, [id]);

    function formatMoney(value: string | null, currency: string) {
        if (value === null) return "—";

        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
        }).format(Number(value));
    }

    if (loading) {
        return <p>Loading receipt...</p>;
    }

    if (error || !receipt) {
        return (
            <div>
                <p>{error || "Receipt not found."}</p>
                <button type="button" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    const currency = receipt.store.currency;

    return (
        <div className="receipt-page">
            <div className="receipt-actions no-print">
                <button type="button" onClick={() => navigate(-1)}>
                    Back
                </button>

                <button type="button" onClick={() => window.print()}>
                    Print Receipt
                </button>
            </div>

            <div className="receipt-paper">
                <header className="receipt-header">
                    {receipt.store.store_logo && (
                        <img

                            src={`http://127.0.0.1:8000${receipt.store.store_logo}`}
                            alt="Store logo"
                            className="receipt-logo"
                        />
                    )}

                    <h2>{receipt.store.business_name}</h2>
                    <h3>SALES RECEIPT</h3>

                    <p>Receipt: {receipt.receipt_number}</p>
                    <p>Order: OH-{receipt.order_id}</p>
                    <p>
                        Date:{" "}
                        {new Date(receipt.created_at).toLocaleString()}
                    </p>
                </header>

                <hr />

                <section className="receipt-information">
                    <p>
                        <strong>Customer:</strong> {receipt.customer_name}
                    </p>
                    <p>
                        <strong>Issued by:</strong> {receipt.issued_by_name}
                    </p>
                </section>

                <hr />

                <section>
                    <h3>Items</h3>

                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Discount</th>
                                <th>Tax</th>
                                <th>Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {receipt.items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.product_name}</strong>
                                        <small>{item.product_sku}</small>
                                    </td>

                                    <td>{item.amount_bought}</td>

                                    <td>
                                        {formatMoney(
                                            item.unit_price_before_discount,
                                            currency
                                        )}
                                    </td>

                                    <td>
                                        {formatMoney(
                                            item.discount_amount,
                                            currency
                                        )}
                                        <small>
                                            {item.discount_rate ?? "0.00"}%
                                        </small>
                                    </td>

                                    <td>
                                        {formatMoney(
                                            item.tax_amount,
                                            currency
                                        )}
                                        <small>
                                            {item.tax_rate ?? "0.00"}%
                                        </small>
                                    </td>

                                    <td>
                                        {formatMoney(
                                            item.line_total,
                                            currency
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <hr />

                <section className="receipt-totals">
                    <p>
                        <span>Total:</span>
                        <strong>
                            {formatMoney(receipt.total, currency)}
                        </strong>
                    </p>

                    <p>
                        <span>Amount paid:</span>
                        <strong>
                            {formatMoney(receipt.amount_paid, currency)}
                        </strong>
                    </p>

                    <p>
                        <span>Balance due:</span>
                        <strong>
                            {formatMoney(receipt.balance_due, currency)}
                        </strong>
                    </p>

                    <p>
                        <span>Payment status:</span>
                        <strong>{receipt.payment_status}</strong>
                    </p>
                </section>

                <hr />

                <section>
                    <h3>Payments</h3>

                    {receipt.payments.map((payment) => (
                        <div className="receipt-payment" key={payment.id}>
                            <div>
                                <strong>{payment.method}</strong>

                                {payment.provider && (
                                    <small>{payment.provider}</small>
                                )}

                                {payment.reference_number && (
                                    <small>
                                        Ref: {payment.reference_number}
                                    </small>
                                )}
                            </div>

                            <strong>
                                {formatMoney(payment.amount, currency)}
                            </strong>
                        </div>
                    ))}
                </section>

                <hr />

                <footer className="receipt-footer">
                    <p>{receipt.store.receipt_footer}</p>
                    <p>Thank you for shopping with us!</p>
                </footer>
            </div>
        </div>
    );
}

export default ReceiptPage;
