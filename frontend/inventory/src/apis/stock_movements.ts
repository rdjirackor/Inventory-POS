// import type { StockMovement } from "../interfaces/interfaces";
// import { apiFetch } from "./api";

// export async function getStockMovements(): Promise<StockMovement[]> {
//     const response = await apiFetch("/stock-movements/");

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(
//             data.message || "Get Stock Movements Failed"
//         );
//     }

//     return data;
// }

// export async function createStockMovement(
//     product: number,
//     quantity: number,
//     movement_type: string,
//     performed_by: number,
//     reason: string
// ) {
//     const response = await apiFetch(
//         "/stock-movements/",
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 product,
//                 quantity,
//                 movement_type,
//                 performed_by,
//                 reason,
//             }),
//         }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(
//             data.message || "Create Stock Movement Failed"
//         );
//     }

//     return data;
// }

// export async function getStockMovement(
//     stock_movement_id: number
// ): Promise<StockMovement> {
//     const response = await apiFetch(
//         `/stock-movements/${stock_movement_id}/`
//     );

//     const data = await response.json();

//     if (!response.ok) {
//         throw new Error(
//             data.message || "Get Stock Movement Failed"
//         );
//     }

//     return data;
// }

import type { StockMovement } from "../interfaces/interfaces";
import { apiFetch } from "./api";

export interface ModifyStock {
    product_id: number;
    quantity: number;
    direction: "Increase" | "Decrease";
    reason: string;
}

export async function modify_stock(
    adjustment: ModifyStock
) {
    const response = await apiFetch(
        "/stock-movements/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(adjustment),
        }
    );

    // const data = await response.json();
    const responseText = await response.text();

    let data;
    try {
        data = JSON.parse(responseText);
    } catch {
        throw new Error(
            `Server returned non-JSON (${response.status}): ${
                responseText.slice(0, 300)
            }`
        );
    }

    if (!response.ok) {
        throw new Error(
            data.error ||
            data.message ||
            "Failed to modify stock"
        );
    }

    return data;
}



export async function getStockMovements(): Promise<StockMovement[]> {
    const response = await apiFetch("/stock-movements/");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Stock Movements Failed"
        );
    }

    return data;
}

export async function getStockMovement(
    stock_movement_id: number
): Promise<StockMovement> {
    const response = await apiFetch(
        `/stock-movements/${stock_movement_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Get Stock Movement Failed"
        );
    }

    return data;
}
