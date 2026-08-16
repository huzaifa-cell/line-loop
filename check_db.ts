import { getStorefrontProducts, getStorefrontProduct } from "./lib/storefront";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
  try {
    const products = await getStorefrontProducts();
    console.log(`Found ${products.length} products`);
    if (products.length > 0) {
      console.log(`Testing getStorefrontProduct for id: ${products[0].id}`);
      const product = await getStorefrontProduct(products[0].id);
      console.log("Success by ID");
      
      // We don't have slug on the mapped UI product, let's just fetch directly
    }
  } catch (e) {
    console.error("Test failed:", e);
  }
}

test();
