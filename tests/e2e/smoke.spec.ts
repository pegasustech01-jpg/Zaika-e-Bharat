import { test, expect } from "@playwright/test";

test("public homepage loads and API returns published content", async ({ page, request }) => {
  const res = await request.get("/api/content");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(0);
  expect(body.every((e: any) => e.status === "Published")).toBeTruthy();

  await page.goto("/");
  await expect(page.locator("h1:has-text('Welcome to Zaika-e-Bharat')")).toBeVisible();
});

test("admin login flow with configured credentials", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator("h1:has-text('Admin Console')")).toBeVisible();

  await page.locator('input[placeholder="owner@example.com"]').fill("tejuj7223@gmail.com");
  await page.locator('input[placeholder="Enter your password"]').fill("TEJU$");
  await page.locator('button:has-text("Enter Admin Console")').click();

  await expect(page.locator("h1:has-text('Content Atelier')")).toBeVisible({ timeout: 15000 });

  const adminRes = await page.request.get("/api/admin/content");
  expect(adminRes.ok()).toBeTruthy();
});
