import fs from 'fs';
import path from 'path';

function loadData(filename: string) {
  const filepath = path.join(process.cwd(), 'data', filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function runAnalysis() {
  const listings = loadData('listings.json');
  const rentals = loadData('rentals.json');
  const projects = loadData('projects.json');

  const answers: any = {};

  answers.total_listing_records = listings.length;

  const activeListings = listings.filter((l: any) => l.is_live === true);
  answers.active_listings = activeListings.length;

  const corruptListings = listings.filter((l: any) => 
    (l.floor > l.total_floors) || 
    (l.carpet_area > l.super_built_up_area)
  );
  answers.corrupt_listing_ids = corruptListings.map((l: any) => l.listing_id).sort();

  const targetLocality = 'dlf phase 3';
  const localityRentals = rentals.filter((r: any) => 
    r.locality && r.locality.toLowerCase() === targetLocality
  );
  answers.total_monthly_rent = localityRentals.reduce((sum: number, r: any) => sum + (r.price || 0), 0);

  let costliest = projects[0];
  projects.forEach((p: any) => {
    if (p.price_max > costliest.price_max) {
      costliest = p;
    }
  });
  // Assuming the 98.9 value is in Crores, convert to INR for the submission
  answers.costliest_project = {
    project_id: costliest.project_id,
    price_max_inr: costliest.price_max * 10000000 
  };

  const refDate = new Date('2026-09-10T00:00:00+05:30').getTime();
  const sevenDaysBefore = refDate - (7 * 24 * 60 * 60 * 1000);
  const recentListings = listings.filter((l: any) => {
    const postedTime = new Date(l.posted_at).getTime();
    return postedTime >= sevenDaysBefore && postedTime < refDate;
  });
  answers.listings_last_7_days = recentListings.length;

  const projectListingCounts: Record<string, number> = {};
  listings.forEach((l: any) => {
    if (l.project_id) {
      projectListingCounts[l.project_id] = (projectListingCounts[l.project_id] || 0) + 1;
    }
  });

  let wrongCountProjects = 0;
  projects.forEach((p: any) => {
    const actualCount = projectListingCounts[p.project_id] || 0;
    if (p.total_listings !== actualCount) {
      wrongCountProjects++;
    }
  });
  answers.projects_with_wrong_listing_count = wrongCountProjects;

  // Q2. Unique Properties
  // A single physical property can be listed by multiple agents. 
  // We can identify unique physical properties by matching exact coordinates, floor, and area.
  const uniqueSignatures = new Set<string>();
  listings.forEach((l: any) => {
    const sig = `${l.latitude?.toFixed(4)}-${l.longitude?.toFixed(4)}-${l.floor}-${l.carpet_area}`;
    uniqueSignatures.add(sig);
  });
  answers.unique_properties = uniqueSignatures.size;

  // Q9. Fake Listings
  // Fake listings to generate enquiries often reuse the exact same description text across multiple listings.
  const descriptionCounts: Record<string, number> = {};
  listings.forEach((l: any) => {
    if (l.description) {
      descriptionCounts[l.description] = (descriptionCounts[l.description] || 0) + 1;
    }
  });

  const fakeListings = listings.filter((l: any) => descriptionCounts[l.description] > 1);
  answers.fake_listing_ids = fakeListings.map((l: any) => l.listing_id).sort();

  // Q6. Average Price per sqft 2BHK
  const valid2BHKs = listings.filter((l: any) => 
    l.is_live === true &&
    l.bedroom === 2 &&
    !answers.corrupt_listing_ids.includes(l.listing_id) &&
    !answers.fake_listing_ids.includes(l.listing_id)
  );

  if (valid2BHKs.length > 0) {
    const sumPricePerSqft = valid2BHKs.reduce((sum: number, l: any) => sum + (l.price / l.carpet_area), 0);
    answers.avg_price_per_sqft_2bhk = parseFloat((sumPricePerSqft / valid2BHKs.length).toFixed(2));
  } else {
    answers.avg_price_per_sqft_2bhk = 0;
  }

  console.log(JSON.stringify(answers, null, 2));
}

runAnalysis();