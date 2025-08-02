import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bundlehub.com" },
    update: {},
    create: {
      email: "admin@bundlehub.com",
      name: "Admin User",
      role: "ADMIN",
    },
  })

  // Create sample customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "John Doe",
      role: "CUSTOMER",
    },
  })

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: "Next.js" },
      update: {},
      create: { name: "Next.js", color: "#000000" },
    }),
    prisma.tag.upsert({
      where: { name: "React" },
      update: {},
      create: { name: "React", color: "#61DAFB" },
    }),
    prisma.tag.upsert({
      where: { name: "TypeScript" },
      update: {},
      create: { name: "TypeScript", color: "#3178C6" },
    }),
    prisma.tag.upsert({
      where: { name: "Tailwind CSS" },
      update: {},
      create: { name: "Tailwind CSS", color: "#06B6D4" },
    }),
    prisma.tag.upsert({
      where: { name: "Dashboard" },
      update: {},
      create: { name: "Dashboard", color: "#8B5CF6" },
    }),
  ])

  // Create technologies
  const technologies = await Promise.all([
    prisma.technology.upsert({
      where: { name: "Next.js 14" },
      update: {},
      create: { name: "Next.js 14", category: "frontend" },
    }),
    prisma.technology.upsert({
      where: { name: "TypeScript" },
      update: {},
      create: { name: "TypeScript", category: "frontend" },
    }),
    prisma.technology.upsert({
      where: { name: "Tailwind CSS" },
      update: {},
      create: { name: "Tailwind CSS", category: "frontend" },
    }),
    prisma.technology.upsert({
      where: { name: "Prisma" },
      update: {},
      create: { name: "Prisma", category: "backend" },
    }),
    prisma.technology.upsert({
      where: { name: "NextAuth.js" },
      update: {},
      create: { name: "NextAuth.js", category: "backend" },
    }),
  ])

  // Create sample bundle
  const bundle = await prisma.bundle.create({
    data: {
      name: "Dashboard Pro",
      slug: "dashboard-pro",
      shortDescription: "Complete admin dashboard solution with analytics and user management",
      description:
        "Dashboard Pro is a comprehensive admin dashboard solution built with Next.js 14, TypeScript, and Tailwind CSS. It includes everything you need to build a modern, responsive admin interface with real-time analytics, user management, and beautiful data visualizations.",
      price: 49.0,
      originalPrice: 79.0,
      setupTime: "15 minutes",
      difficulty: "INTERMEDIATE",
      estimatedValue: "₹2,00,000+",
      category: "Full-Stack",
      demoUrl: "https://dashboard-demo.example.com",
      githubUrl: "https://github.com/example/dashboard-pro",
      isActive: true,
      isFeatured: true,
      isBestseller: true,
    },
  })

  // Add bundle images
  await prisma.bundleImage.createMany({
    data: [
      {
        bundleId: bundle.id,
        url: "/placeholder.svg?height=400&width=600",
        alt: "Dashboard Pro Main View",
        order: 0,
      },
      {
        bundleId: bundle.id,
        url: "/placeholder.svg?height=400&width=600",
        alt: "Dashboard Pro Analytics",
        order: 1,
      },
      {
        bundleId: bundle.id,
        url: "/placeholder.svg?height=400&width=600",
        alt: "Dashboard Pro User Management",
        order: 2,
      },
    ],
  })

  // Link bundle to tags
  await prisma.bundleTag.createMany({
    data: [
      { bundleId: bundle.id, tagId: tags[0].id }, // Next.js
      { bundleId: bundle.id, tagId: tags[1].id }, // React
      { bundleId: bundle.id, tagId: tags[2].id }, // TypeScript
      { bundleId: bundle.id, tagId: tags[3].id }, // Tailwind CSS
      { bundleId: bundle.id, tagId: tags[4].id }, // Dashboard
    ],
  })

  // Link bundle to technologies
  await prisma.bundleTech.createMany({
    data: [
      { bundleId: bundle.id, techId: technologies[0].id }, // Next.js 14
      { bundleId: bundle.id, techId: technologies[1].id }, // TypeScript
      { bundleId: bundle.id, techId: technologies[2].id }, // Tailwind CSS
      { bundleId: bundle.id, techId: technologies[3].id }, // Prisma
      { bundleId: bundle.id, techId: technologies[4].id }, // NextAuth.js
    ],
  })

  // Add bundle features
  await prisma.bundleFeature.createMany({
    data: [
      {
        bundleId: bundle.id,
        description: "Responsive dashboard layout with sidebar navigation",
        order: 0,
      },
      {
        bundleId: bundle.id,
        description: "Interactive charts and analytics with Recharts",
        order: 1,
      },
      {
        bundleId: bundle.id,
        description: "Complete user management system with CRUD operations",
        order: 2,
      },
      {
        bundleId: bundle.id,
        description: "Dark/light mode support with theme persistence",
        order: 3,
      },
    ],
  })

  // Add bundle includes
  await prisma.bundleInclude.createMany({
    data: [
      {
        bundleId: bundle.id,
        description: "Complete source code with TypeScript",
        order: 0,
      },
      {
        bundleId: bundle.id,
        description: "Comprehensive documentation (50+ pages)",
        order: 1,
      },
      {
        bundleId: bundle.id,
        description: "Video setup tutorial (45 minutes)",
        order: 2,
      },
      {
        bundleId: bundle.id,
        description: "6 months of free updates",
        order: 3,
      },
    ],
  })

  // Create sample review
  await prisma.review.create({
    data: {
      userId: customer.id,
      bundleId: bundle.id,
      rating: 5,
      title: "Excellent dashboard solution!",
      content:
        "This dashboard template saved me weeks of development time. The code quality is exceptional and the documentation is very comprehensive.",
      isPublic: true,
    },
  })

  // Create sample order
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      email: customer.email,
      status: "COMPLETED",
      totalAmount: 49.0,
      paymentMethod: "stripe",
      paymentId: "pi_test_123456789",
    },
  })

  // Create order item
  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      bundleId: bundle.id,
      price: 49.0,
      quantity: 1,
    },
  })

  // Create sample FAQ entries
  await prisma.fAQ.createMany({
    data: [
      {
        question: "How do I get the bundle after purchase?",
        answer:
          "After completing your purchase, you'll receive an email with download links and access instructions within 2 hours.",
        category: "purchase",
        order: 0,
        isActive: true,
      },
      {
        question: "What's your refund policy?",
        answer:
          "We offer a 30-day money-back guarantee. If you're not satisfied with the bundle for any reason, contact us within 30 days of purchase for a full refund.",
        category: "refund",
        order: 1,
        isActive: true,
      },
      {
        question: "Do you provide support and updates?",
        answer: "Yes! We provide 6 months of free updates and email support for setup questions and bug fixes.",
        category: "support",
        order: 2,
        isActive: true,
      },
    ],
  })

  // Create email templates
  await prisma.emailTemplate.createMany({
    data: [
      {
        name: "order_confirmation",
        subject: "Order Confirmation - BundleHub",
        htmlBody:
          "<h1>Thank you for your purchase!</h1><p>Your order has been confirmed and will be processed shortly.</p>",
        textBody: "Thank you for your purchase! Your order has been confirmed and will be processed shortly.",
        isActive: true,
      },
      {
        name: "bundle_delivery",
        subject: "Your Bundle is Ready - BundleHub",
        htmlBody: "<h1>Your bundle is ready for download!</h1><p>Click the link below to download your bundle.</p>",
        textBody: "Your bundle is ready for download! Click the link below to download your bundle.",
        isActive: true,
      },
    ],
  })

  console.log("Database seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
