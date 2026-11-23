import { PrismaClient, EventCategory, OrganizerType, TicketType, Faculty } from "@prisma/client";

const prisma = new PrismaClient();

const daysFromNow = (d: number, hour = 19) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(hour, 0, 0, 0);
  return dt;
};

async function main() {
  // Wipe marketplace data (keeps auth users intact if you already created some).
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.event.deleteMany();

  // Seed sellers. Password login is created through better-auth on signup;
  // these rows exist so listings have realistic owners.
  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { email: "sam.parker@example.com" },
      update: {},
      create: { name: "Sam Parker", email: "sam.parker@example.com", emailVerified: true, faculty: Faculty.ARTSCI, eTransferEmail: "sam.parker@example.com" },
    }),
    prisma.user.upsert({
      where: { email: "priya.n@example.com" },
      update: {},
      create: { name: "Priya N.", email: "priya.n@example.com", emailVerified: true, faculty: Faculty.ENGINEERING, eTransferEmail: "priya.n@example.com" },
    }),
    prisma.user.upsert({
      where: { email: "devon.k@example.com" },
      update: {},
      create: { name: "Devon K.", email: "devon.k@example.com", emailVerified: true, faculty: Faculty.COMMERCE, eTransferEmail: "devon.k@example.com" },
    }),
  ]);

  const events = [
    {
      title: "Homecoming Block Party",
      description: "The biggest outdoor party of the year. Live bands, food trucks and a whole lot of gold and blue.",
      venue: "Richardson Stadium",
      startsAt: daysFromNow(20, 16),
      category: EventCategory.HOMECOMING,
      organizerType: OrganizerType.CLUB,
      organizerName: "Alma Mater Society",
    },
    {
      title: "Engineering Formal 2026",
      description: "Black-tie night for Eng students. Dinner, dancing, and the annual Iron Ring toast.",
      venue: "Grant Hall",
      startsAt: daysFromNow(35, 18),
      category: EventCategory.FORMAL,
      organizerType: OrganizerType.CLUB,
      organizerName: "Engineering Society",
    },
    {
      title: "Frosh Week Kickoff Night",
      description: "Meet your frosh group and kick off the week with music and games.",
      venue: "The ARC",
      startsAt: daysFromNow(12, 19),
      category: EventCategory.FROSH,
      organizerType: OrganizerType.CLUB,
      organizerName: "Orientation Committee",
    },
    {
      title: "Gaels vs. Laurier — Hockey",
      description: "Queen's hockey at the ARC. Come cheer on the Golden Gaels.",
      venue: "The ARC",
      startsAt: daysFromNow(9, 19),
      category: EventCategory.SPORTS,
      organizerType: OrganizerType.CLUB,
      organizerName: "Queen's Athletics",
    },
    {
      title: "Winter Concert Series: Indie Night",
      description: "Local and student indie acts take over Grant Hall.",
      venue: "Grant Hall",
      startsAt: daysFromNow(27, 20),
      category: EventCategory.CONCERTS,
      organizerType: OrganizerType.STUDENT,
      organizerName: "Sam Parker",
    },
    {
      title: "Charity Gala for Kingston Food Bank",
      description: "An evening of dinner and silent auction supporting local families.",
      venue: "Stages",
      startsAt: daysFromNow(45, 18),
      category: EventCategory.CHARITY,
      organizerType: OrganizerType.CLUB,
      organizerName: "Commerce Society",
    },
    {
      title: "Clark Hall Pub Trivia Night",
      description: "Weekly trivia. Teams of up to six. Prizes from local sponsors.",
      venue: "Clark Hall Pub",
      startsAt: daysFromNow(5, 20),
      category: EventCategory.CLUB_EVENT,
      organizerType: OrganizerType.CLUB,
      organizerName: "Artsci Society",
    },
    {
      title: "Res Dinner — Leonard Hall",
      description: "Annual Leonard Hall formal dinner. Dress code: business casual.",
      venue: "Leonard Hall",
      startsAt: daysFromNow(16, 18),
      category: EventCategory.OTHER,
      organizerType: OrganizerType.CLUB,
      organizerName: "Leonard Hall Council",
    },
  ];

  for (const [i, e] of events.entries()) {
    const event = await prisma.event.create({ data: e });
    const seller = sellers[i % sellers.length];
    await prisma.listing.createMany({
      data: [
        {
          eventId: event.id,
          sellerId: seller.id,
          priceCents: 2500 + i * 500,
          quantity: 2,
          ticketType: TicketType.GA,
          notes: "Resale — can't make it, selling at face value.",
          expiresAt: event.startsAt,
        },
        {
          eventId: event.id,
          sellerId: sellers[(i + 1) % sellers.length].id,
          priceCents: 4000 + i * 700,
          quantity: 1,
          ticketType: TicketType.VIP,
          section: "Floor",
          row: "B",
          seat: "12",
          expiresAt: event.startsAt,
        },
      ],
    });
  }

  const counts = {
    users: await prisma.user.count(),
    events: await prisma.event.count(),
    listings: await prisma.listing.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
