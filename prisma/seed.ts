import { config } from "dotenv";
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const PRODUCTS = [
  {
    name: "ProBook Ultraslim Laptop 15",
    slug: "probook-ultraslim-laptop-15",
    description: "14-core Intel CPU, 16 GB RAM, 512 GB SSD. Ultra-thin, ultra-fast — built for creators and professionals.",
    price: 1299.99,
    salePrice: 1099.99,
    stock: 24,
    category: "Laptops",
    brand: "ProBook",
    images: ["/img/product01.png"],
  },
  {
    name: "SwiftBook Air 13 M3",
    slug: "swiftbook-air-13-m3",
    description: "All-day battery, fanless design, 8 GB unified memory. The perfect everyday laptop.",
    price: 999.00,
    salePrice: null,
    stock: 15,
    category: "Laptops",
    brand: "SwiftBook",
    images: ["/img/product02.png"],
  },
  {
    name: "GamerX Pro 17 RTX",
    slug: "gamerx-pro-17-rtx",
    description: "RTX 4070 graphics, 144 Hz display, 32 GB DDR5 RAM. Dominate every game.",
    price: 1899.00,
    salePrice: 1699.00,
    stock: 8,
    category: "Laptops",
    brand: "GamerX",
    images: ["/img/product03.png"],
  },
  {
    name: "Nova S25 Ultra Smartphone",
    slug: "nova-s25-ultra-smartphone",
    description: "200 MP camera, 5000 mAh battery, 6.8\" AMOLED 120 Hz display. Your best shots, every time.",
    price: 1199.00,
    salePrice: 999.00,
    stock: 30,
    category: "Smartphones",
    brand: "Nova",
    images: ["/img/product04.png"],
  },
  {
    name: "Pixel 9 Pro",
    slug: "pixel-9-pro",
    description: "Google AI features built in, 7 years of updates, stunning computational photography.",
    price: 799.00,
    salePrice: null,
    stock: 20,
    category: "Smartphones",
    brand: "Pixel",
    images: ["/img/product05.png"],
  },
  {
    name: "OnePlus 13 Ace",
    slug: "oneplus-13-ace",
    description: "Snapdragon 8 Elite, 100W fast charging, smooth 120 Hz ProMotion display.",
    price: 649.00,
    salePrice: 579.00,
    stock: 18,
    category: "Smartphones",
    brand: "OnePlus",
    images: ["/img/product06.png"],
  },
  {
    name: "Alpha ZV-E10 Mirrorless Camera",
    slug: "alpha-zv-e10-mirrorless",
    description: "24.2 MP APS-C sensor, 4K video, flip-out touchscreen. Perfect for vloggers and content creators.",
    price: 749.00,
    salePrice: 649.00,
    stock: 12,
    category: "Cameras",
    brand: "Alpha",
    images: ["/img/product07.png"],
  },
  {
    name: "ProShot DSLR 850D",
    slug: "proshot-dslr-850d",
    description: "45 MP full-frame sensor, dual card slots, weather sealed body. Professional grade.",
    price: 2499.00,
    salePrice: null,
    stock: 5,
    category: "Cameras",
    brand: "ProShot",
    images: ["/img/product08.png"],
  },
  {
    name: "Instax Mini 40 Instant Camera",
    slug: "instax-mini-40-instant",
    description: "Retro design, auto-exposure, selfie mode. Print memories instantly.",
    price: 99.99,
    salePrice: 79.99,
    stock: 40,
    category: "Cameras",
    brand: "Instax",
    images: ["/img/product09.png"],
  },
  {
    name: "SoundPro ANC Headphones",
    slug: "soundpro-anc-headphones",
    description: "40-hour battery, industry-leading Active Noise Cancellation, Hi-Res Audio certified.",
    price: 349.99,
    salePrice: 279.99,
    stock: 35,
    category: "Accessories",
    brand: "SoundPro",
    images: ["/img/product01.png"],
  },
  {
    name: "UltraSlim USB-C Hub 10-in-1",
    slug: "ultraslim-usbc-hub-10in1",
    description: "HDMI 4K, 100W PD charging, SD card reader, 3× USB 3.0. One hub for everything.",
    price: 69.99,
    salePrice: 49.99,
    stock: 50,
    category: "Accessories",
    brand: "UltraSlim",
    images: ["/img/product02.png"],
  },
  {
    name: "FastCharge 65W GaN Adapter",
    slug: "fastcharge-65w-gan-adapter",
    description: "GaN technology, charge laptop + phone + tablet simultaneously, travel-ready compact design.",
    price: 54.99,
    salePrice: null,
    stock: 60,
    category: "Accessories",
    brand: "FastCharge",
    images: ["/img/product03.png"],
  },
];

async function main() {
  // ── Admin account ────────────────────────────────────────────────────────
  const adminEmail = "abahvictor760@gmail.com";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { email: adminEmail }, data: { role: "ADMIN" } });
      console.log(`✅ Upgraded "${adminEmail}" to ADMIN role`);
    } else {
      console.log(`✅ Admin account "${adminEmail}" already exists`);
    }
  } else {
    const hashed = await bcrypt.hash("Admin@1234", 12);
    await prisma.user.create({
      data: { email: adminEmail, name: "Admin", password: hashed, role: "ADMIN", active: true },
    });
    console.log(`✅ Created admin account: ${adminEmail} / Admin@1234`);
  }

  // ── Sample products ──────────────────────────────────────────────────────
  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) { skipped++; continue; }
    await prisma.product.create({ data: p });
    created++;
  }

  console.log(`✅ Products: ${created} created, ${skipped} already existed`);
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
