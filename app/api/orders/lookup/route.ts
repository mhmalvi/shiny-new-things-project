import { type NextRequest, NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, email, shopDomain } = await request.json()

    // Demo environment - return mock data
    if (shopDomain === "demo-store.myshopify.com" || shopDomain === "demo-store") {
      const mockOrder = {
        id: "1001",
        order_number: orderNumber || "1001",
        email: email || "customer@example.com",
        created_at: "2024-01-15T10:00:00Z",
        financial_status: "paid",
        fulfillment_status: "fulfilled",
        total_price: "99.99",
        currency: "USD",
        line_items: [
          {
            id: "1",
            title: "Premium T-Shirt",
            variant_title: "Large / Blue",
            quantity: 1,
            price: "29.99",
            sku: "TSHIRT-L-BLUE",
            product_id: "123",
            variant_id: "456",
          },
          {
            id: "2",
            title: "Cotton Hoodie",
            variant_title: "Medium / Gray",
            quantity: 1,
            price: "69.99",
            sku: "HOODIE-M-GRAY",
            product_id: "789",
            variant_id: "101",
          },
        ],
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          address1: "123 Main St",
          city: "New York",
          province: "NY",
          zip: "10001",
          country: "United States",
        },
        billing_address: {
          first_name: "John",
          last_name: "Doe",
          address1: "123 Main St",
          city: "New York",
          province: "NY",
          zip: "10001",
          country: "United States",
        },
      }

      return NextResponse.json({
        success: true,
        order: mockOrder,
      })
    }

    // Production environment - use Shopify API
    if (!orderNumber || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Order number and email are required",
        },
        { status: 400 },
      )
    }

    const shopifyService = new ShopifyService(shopDomain)
    const order = await shopifyService.findOrderByNumber(orderNumber, email)

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found or email doesn't match",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error("Order lookup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to lookup order",
      },
      { status: 500 },
    )
  }
}
