import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const isVercel = !!process.env.VERCEL;

async function getBrowser() {
  if (isVercel) {
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  const localPuppeteer = await import('puppeteer');

  return localPuppeteer.default.launch({
    headless: true,
  });
}

export async function POST(request: NextRequest) {
  let browser;

  try {
    const { html, filename } = await request.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML required' }, { status: 400 });
    }

    browser = await getBrowser();

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'document.pdf'}"`,
      },
    });
  } catch (err) {
    console.error('PDF ERROR:', err);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
