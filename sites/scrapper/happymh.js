import { chromium } from "playwright";

export async function getHappyMhImg(url) {
    let browser;
    let page;
    
    try {
        browser = await chromium.launch({
            headless: false, // تغيير إلى true إذا أردت headless
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-blink-features=AutomationControlled",
                "--no-zygote",
                "--disable-infobars",
                "--start-maximized",
                "--disable-extensions",
                "--disable-plugins",
                "--disable-translate",
                "--disable-default-apps",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-backgrounding-occluded-windows",
                "--disable-ipc-flooding-protection",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
                "--no-first-run",
                "--no-default-browser-check"
            ],
        });

        const context = await browser.newContext({
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport: { width: 1366, height: 768 },
            locale: "en-US",
            timezoneId: "Asia/Riyadh",
            permissions: [],
            extraHTTPHeaders: {
                "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1"
            },
        });

        // منع فتح صفحات جديدة غير مرغوب فيها
        context.on('page', async (newPage) => {
            await newPage.close();
        });

        page = await context.newPage();

        // إخفاء automation بشكل أكثر فعالية
        await page.addInitScript(() => {
            // إزالة جميع علامات automation
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    {
                        name: 'Chrome PDF Plugin',
                        filename: 'internal-pdf-viewer',
                        description: 'Portable Document Format'
                    },
                    {
                        name: 'Chrome PDF Viewer',
                        filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
                        description: 'Portable Document Format'
                    },
                    {
                        name: 'Native Client',
                        filename: 'internal-nacl-plugin',
                        description: ''
                    }
                ],
            });
            
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en', 'ar'],
            });

            // محاكاة Chrome runtime
            window.chrome = {
                runtime: {
                    connect: () => ({
                        onDisconnect: { addListener: () => {} },
                        onMessage: { addListener: () => {} },
                        disconnect: () => {},
                        postMessage: () => {},
                    }),
                    sendMessage: () => {},
                    onConnect: { addListener: () => {} },
                    onMessage: { addListener: () => {} },
                    getManifest: () => ({}),
                    getURL: (path) => path,
                    id: 'testid',
                },
                loadTimes: () => ({
                    firstPaintTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                    requestTime: performance.timing.requestStart - performance.timing.navigationStart,
                    startLoadTime: performance.timing.navigationStart,
                    commitLoadTime: performance.timing.responseStart,
                    finishDocumentLoadTime: performance.timing.domContentLoadedEventEnd,
                    finishLoadTime: performance.timing.loadEventEnd,
                    firstPaintAfterLoadTime: 0,
                    navigationType: 'Other',
                }),
                csi: () => ({
                    onloadT: performance.timing.loadEventEnd,
                    startE: performance.timing.navigationStart,
                    pageT: performance.timing.loadEventEnd - performance.timing.navigationStart,
                    tran: 15,
                }),
                app: {
                    isInstalled: false,
                    getDetails: () => null,
                    runningState: 'cannot_run',
                },
                webstore: {
                    onInstallStageChanged: { addListener: () => {} },
                    onDownloadProgress: { addListener: () => {} },
                },
            };

            // إزالة permissions API
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => {
                if (parameters.name === 'notifications') {
                    return Promise.resolve({ state: Notification.permission });
                }
                return originalQuery(parameters);
            };

            // إخفاء خاصية automation في console
            Object.defineProperty(window, 'cdc_adoQpoasnfa76pfcZLmcfl_Array', {
                value: undefined,
            });
            Object.defineProperty(window, 'cdc_adoQpoasnfa76pfcZLmcfl_Promise', {
                value: undefined,
            });
            Object.defineProperty(window, 'cdc_adoQpoasnfa76pfcZLmcfl_Symbol', {
                value: undefined,
            });

            // إخفاء خاصية automation في document
            Object.defineProperty(document, 'hidden', {
                get: () => false,
            });
            Object.defineProperty(document, 'visibilityState', {
                get: () => 'visible',
            });
        });

        console.log("جاري فتح الصفحة...");
        
        // استراتيجية متعددة المحاولات مع تحسينات
        let retries = 3;
        let success = false;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`المحاولة ${attempt} من ${retries}...`);
                
                // استخدام waitUntil: 'domcontentloaded' بدلاً من 'networkidle'
                await page.goto(url, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 60000 
                });

                // فحص Cloudflare
                const cloudflareDetected = await checkCloudflare(page);
                
                if (cloudflareDetected) {
                    console.log("تم اكتشاف Cloudflare، جاري المعالجة...");
                    const cloudflareResult = await handleCloudflare(page);
                    if (!cloudflareResult) {
                        throw new Error("فشل في تخطي Cloudflare");
                    }
                }

                // التحقق من نجاح التحميل
                await page.waitForSelector('body', { timeout: 10000 });
                
                const pageTitle = await page.title();
                const pageUrl = page.url();
                
                console.log(`العنوان: ${pageTitle}`);
                console.log(`الرابط: ${pageUrl}`);

                // فحص أكثر دقة لـ Cloudflare
                const isStillBlocked = await page.evaluate(() => {
                    return document.title.includes('Just a moment') || 
                           document.title.includes('Checking your browser') ||
                           document.title.includes('Please Wait') ||
                           document.body.textContent.includes('DDoS protection') ||
                           document.querySelector('[id*="cloudflare"], [class*="cloudflare"], [id*="challenge"], [class*="challenge"]') !== null;
                });

                if (isStillBlocked) {
                    console.log("لا يزال Cloudflare نشطًا");
                    
                    if (attempt < retries) {
                        console.log("جاري إعادة المحاولة...");
                        // تنظيف الكوكيز والستورج قبل إعادة المحاولة
                        await context.clearCookies();
                        await page.evaluate(() => {
                            localStorage.clear();
                            sessionStorage.clear();
                        });
                        await page.waitForTimeout(3000);
                        continue;
                    } else {
                        throw new Error("فشل في تخطي Cloudflare بعد جميع المحاولات");
                    }
                }

                success = true;
                console.log("✅ تم تخطي الحماية بنجاح!");
                break;
                
            } catch (error) {
                console.log(`❌ المحاولة ${attempt} فشلت: ${error.message}`);
                
                if (attempt < retries) {
                    console.log("🔄 جاري إعادة المحاولة بعد 5 ثوان...");
                    await page.waitForTimeout(5000);
                    
                    // تنظيف شامل قبل إعادة المحاولة
                    try {
                        await context.clearCookies();
                        await page.evaluate(() => {
                            localStorage.clear();
                            sessionStorage.clear();
                        });
                    } catch (e) {
                        // تجاهل أخطاء التنظيف
                    }
                }
            }
        }

        if (!success) {
            throw new Error("فشل في تحميل الصفحة بعد جميع المحاولات");
        }

        // الانتظار للعنصر المستهدف
        console.log("جاري الانتظار للعناصر...");
        try {
            await page.waitForSelector('article.css-8o1tmw-root', { timeout: 15000 });
        } catch (error) {
            console.log("لم يتم العثور على العنصر المستهدف، جاري البحث عن الصور مباشرة...");
        }

        // التمرين لجمع الصور
        console.log("جاري التمرين لجمع الصور...");
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let lastCount = 0;
                let noChangeCount = 0;
                const maxNoChange = 3;
                let scrollAttempts = 0;
                const maxScrollAttempts = 20;
                
                const scroll = () => {
                    scrollAttempts++;
                    window.scrollBy(0, 800); // تقليل كمية التمرين
                    
                    const currentCount = document.querySelectorAll('img[id^="scan"][src*="ruicdn.happymh.com"]').length;
                    console.log(`تم العثور على ${currentCount} صورة حتى الآن...`);
                    
                    // التحقق إذا توقف العدد عن الزيادة
                    if (currentCount === lastCount) {
                        noChangeCount++;
                    } else {
                        noChangeCount = 0;
                    }
                    lastCount = currentCount;
                    
                    // شروط التوقف
                    const reachedBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200;
                    const noMoreImages = noChangeCount >= maxNoChange && currentCount >= 1;
                    const tooManyAttempts = scrollAttempts >= maxScrollAttempts;
                    
                    if (reachedBottom || noMoreImages || tooManyAttempts) {
                        console.log(`توقف التمرين - السبب: ${reachedBottom ? 'نهاية الصفحة' : noMoreImages ? 'توقف العدد' : 'تجاوز الحد الأقصى'}`);
                        return setTimeout(resolve, 2000);
                    }
                    
                    setTimeout(scroll, 1000); // زيادة الوقت بين التمرينات
                };
                scroll();
            });
        });

        // انتظار إضافي لضمان تحميل جميع الصور
        await page.waitForTimeout(3000);

        // استخراج الصور
        console.log("جاري استخراج الصور...");
        const images = await page.evaluate(() => {
            const imageElements = Array.from(document.querySelectorAll('img'));
            console.log(`تم العثور على ${imageElements.length} عنصر img في الصفحة`);
            
            const targetImages = imageElements.filter(img => {
                const src = img.src || '';
                const id = img.id || '';
                return (id.startsWith('scan') && src.includes('ruicdn.happymh.com') && src.includes('.jpg'));
            });
            
            console.log(`تم تصفية ${targetImages.length} صورة مستهدفة`);
            
            return targetImages
                .map(img => img.src)
                .filter(src => src && src.trim() !== '')
                .map(src => {
                    if (src.includes("?q=")) {
                        return src.replace(/\?q=\d+/, "?q=100");
                    } else {
                        return src + (src.includes('?') ? '&q=100' : '?q=100');
                    }
                });
        });

        console.log(`✅ تم استخراج ${images.length} صورة بنجاح`);
        
        if (images.length === 0) {
            console.log("⚠️  لم يتم العثور على أي صور، جاري فحص محتوى الصفحة...");
            const pageContent = await page.content();
            const hasImageReferences = pageContent.includes('ruicdn.happymh.com');
            console.log(`📄 ${hasImageReferences ? 'تم العثور على إشارات للصور في HTML' : 'لا توجد إشارات للصور في HTML'}`);
        }
        
        return images;

    } catch (error) {
        console.error("❌ Error:", error.message);
        return [];
    } finally {
        if (browser) {
            await browser.close();
            console.log("تم إغلاق المتصفح");
        }
    }
}

// دوال مساعدة محسنة
async function checkCloudflare(page) {
    try {
        const checks = await Promise.allSettled([
            page.$('iframe[title*="challenge"], iframe[src*="cloudflare"]'),
            page.$('#cf-content, .challenge-form, .ray-id, .cf-browser-verification'),
            page.evaluate(() => {
                const title = document.title.toLowerCase();
                const bodyText = document.body.textContent.toLowerCase();
                return title.includes('just a moment') || 
                       title.includes('checking your browser') || 
                       title.includes('please wait') ||
                       bodyText.includes('ddos protection') ||
                       bodyText.includes('cloudflare') ||
                       bodyText.includes('verifying');
            })
        ]);

        return checks.some(check => 
            check.status === 'fulfilled' && 
            (check.value === true || check.value !== null)
        );
    } catch {
        return false;
    }
}

async function handleCloudflare(page) {
    try {
        console.log("🛡️  جاري معالجة Cloudflare...");
        
        // انتظار أولي مع تحسينات
        await page.waitForTimeout(5000);
        
        // محاكاة سلوك بشري أكثر واقعية
        const viewport = page.viewportSize();
        if (viewport) {
            const moves = [
                [100, 100], [300, 200], [200, 150], 
                [250, 180], [150, 120], [280, 160]
            ];
            
            for (const [x, y] of moves) {
                if (x < viewport.width && y < viewport.height) {
                    await page.mouse.move(x, y);
                    await page.waitForTimeout(800 + Math.random() * 800);
                }
            }
        }
        
        // محاولة التفاعل مع عناصر Cloudflare
        const clickSelectors = [
            'input[type="button"]',
            'button',
            'input[type="submit"]',
            '.btn',
            '[role="button"]'
        ];
        
        for (const selector of clickSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    await element.click({ delay: 100 + Math.random() * 200 });
                    console.log(`✅ تم النقر على: ${selector}`);
                    await page.waitForTimeout(3000);
                    break;
                }
            } catch (e) {
                // تجاهل إذا لم يكن قابلاً للنقر
            }
        }
        
        // الانتظار حتى يختفي التحدي
        const challengeResolved = await page.waitForFunction(() => {
            const hasChallenge = document.querySelector(
                'iframe[title*="challenge"], #cf-content, .challenge-form, .ray-id, .cf-browser-verification'
            );
            const isBlockedTitle = document.title.includes('Just a moment') || 
                                  document.title.includes('Checking your browser') ||
                                  document.title.includes('Please Wait');
            return !hasChallenge && !isBlockedTitle;
        }, { timeout: 45000 }).catch(() => false);

        if (challengeResolved) {
            console.log("✅ تم معالجة Cloudflare بنجاح");
            return true;
        } else {
            console.log("❌ فشل في معالجة Cloudflare");
            return false;
        }
        
    } catch (error) {
        console.log("⚠️  خطأ في معالجة Cloudflare:", error.message);
        return false;
    }
}