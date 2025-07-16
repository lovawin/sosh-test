const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');

const axios = require('axios');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const logging = require('../logging');

puppeteerExtra.use(StealthPlugin());

const getTemplate = (tweetBody) => {
  const htmltemplate = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        </head>
    <body>
               ${tweetBody}
    </body>
    </html>`;
  return htmltemplate;
};

const postScreenshot = async (postURL, postPlatform) => {
  // Create a request ID for tracking this operation
  const requestId = `screenshot-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Log the start of the screenshot process
  logging.apiLogger.logRequest({
    method: 'SCREENSHOT',
    url: postURL,
    context: {
      requestId,
      operation: 'screenshot_start',
      platform: postPlatform,
      url: postURL
    }
  });
  
  try {
    // got tweet body from publish tweet api
    let platformAPIURL;
    let postClass;
    const tweetUrl = new URL(postURL);
    
    if (postPlatform === 'twitter') {
      platformAPIURL = `https://publish.twitter.com/oembed?url=${tweetUrl}`;
      postClass = '.twitter-tweet';
    }
    if (postPlatform === 'instagram') {
      platformAPIURL = `https://api.instagram.com/oembed/?url=${tweetUrl}`;
      postClass = '.instagram-media';
    }
    if (postPlatform === 'youtube') {
      platformAPIURL = `https://www.youtube.com/oembed?url=${tweetUrl}&format=json`;
      postClass = '.youtube-media';
    }
    if (postPlatform === 'tiktok') {
      platformAPIURL = `https://www.tiktok.com/oembed?url=${tweetUrl}`;
      postClass = '.tiktok-embed';
    }
    
    // Log the oembed API request
    logging.apiLogger.logRequest({
      method: 'GET',
      url: platformAPIURL,
      context: {
        requestId,
        operation: 'oembed_api_request',
        platform: postPlatform,
        originalUrl: postURL
      }
    });
    
    const { data: oembedResponse } = await axios.get(platformAPIURL);
    
    // Log successful oembed API response
    logging.apiLogger.logRequest({
      method: 'GET',
      url: platformAPIURL,
      context: {
        requestId,
        operation: 'oembed_api_success',
        platform: postPlatform,
        responseSize: JSON.stringify(oembedResponse).length
      }
    });
    // Log browser launch attempt
    logging.apiLogger.logRequest({
      method: 'BROWSER',
      url: postURL,
      context: {
        requestId,
        operation: 'browser_launch',
        platform: postPlatform
      }
    });
    
    // open headless browser
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        // '--single-process',
      ],
      timeout: 60000,
    }).catch(error => {
      // Log browser launch error
      logging.errorLogger.logError(error, {
        context: 'puppeteer_browser_launch',
        requestId,
        platform: postPlatform,
        url: postURL,
        operation: 'browser_launch',
        errorType: error.name,
        errorMessage: error.message
      });
      throw error;
    });
    
    // Log successful browser launch
    logging.apiLogger.logRequest({
      method: 'BROWSER',
      url: postURL,
      context: {
        requestId,
        operation: 'browser_launch_success',
        platform: postPlatform
      }
    });
    
    const page = await browser.newPage().catch(error => {
      // Log page creation error
      logging.errorLogger.logError(error, {
        context: 'puppeteer_new_page',
        requestId,
        platform: postPlatform,
        url: postURL,
        operation: 'new_page',
        errorType: error.name,
        errorMessage: error.message
      });
      throw error;
    });
    
    await page.setViewport({
      width: 800,
      height: 1000,
    }).catch(error => {
      // Log viewport setting error
      logging.errorLogger.logError(error, {
        context: 'puppeteer_set_viewport',
        requestId,
        platform: postPlatform,
        url: postURL,
        operation: 'set_viewport',
        errorType: error.name,
        errorMessage: error.message
      });
      throw error;
    });

    if (postPlatform === 'instagram') {
      oembedResponse.html = oembedResponse.html.replace('//www.instagram.com/embed.js', 'http://www.instagram.com/embed.js');
    }

    if (postPlatform === 'youtube') {
      const youtubeOembedArray = oembedResponse.html.split(' ');
      const youtubeClassAdd = `${youtubeOembedArray[0]} class="youtube-media"`;
      const newYoutubeOembed = oembedResponse.html.split(' ');
      newYoutubeOembed[0] = youtubeClassAdd;
      newYoutubeOembed[1] = 'width="550"';
      newYoutubeOembed[2] = 'height="504"';
      oembedResponse.html = newYoutubeOembed.join(' ');
    }

    if (postPlatform === 'tiktok') {
      try {
        // Log TikTok specific browser launch
        logging.apiLogger.logRequest({
          method: 'BROWSER',
          url: postURL,
          context: {
            requestId,
            operation: 'tiktok_browser_launch',
            platform: postPlatform,
            tiktokPath: `https://www.tiktok.com/embed/v2/${tweetUrl.pathname.split('/')[3]}`
          }
        });
        
        const browserTiktok = await puppeteerExtra.launch({
          executablePath: '/usr/bin/google-chrome',
          headless: true,
          args: ['--no-sandbox'],
        }).catch(error => {
          // Log TikTok browser launch error
          logging.errorLogger.logError(error, {
            context: 'tiktok_browser_launch',
            requestId,
            platform: postPlatform,
            url: postURL,
            operation: 'tiktok_browser_launch',
            errorType: error.name,
            errorMessage: error.message
          });
          throw error;
        });
        
        const pageTiktok = await browserTiktok.newPage();
        await pageTiktok.setViewport({
          width: 600,
          height: 800,
        });
        
        // Log TikTok page navigation
        logging.apiLogger.logRequest({
          method: 'NAVIGATE',
          url: `https://www.tiktok.com/embed/v2/${tweetUrl.pathname.split('/')[3]}`,
          context: {
            requestId,
            operation: 'tiktok_page_navigation',
            platform: postPlatform
          }
        });
        
        await pageTiktok.goto(`https://www.tiktok.com/embed/v2/${tweetUrl.pathname.split('/')[3]}`).catch(error => {
          // Log TikTok navigation error
          logging.errorLogger.logError(error, {
            context: 'tiktok_page_navigation',
            requestId,
            platform: postPlatform,
            url: `https://www.tiktok.com/embed/v2/${tweetUrl.pathname.split('/')[3]}`,
            operation: 'page_goto',
            errorType: error.name,
            errorMessage: error.message
          });
          throw error;
        });

        await pageTiktok.waitForTimeout(9000);

        // Log TikTok screenshot attempt
        logging.apiLogger.logRequest({
          method: 'SCREENSHOT',
          url: postURL,
          context: {
            requestId,
            operation: 'tiktok_screenshot_attempt',
            platform: postPlatform
          }
        });
        
        const buffer = await pageTiktok.screenshot({
          clip: {
            x: 60,
            y: 8,
            width: Math.min(480, pageTiktok.viewport().width),
            height: Math.min(600, pageTiktok.viewport().height),
          },
        }).catch(error => {
          // Log TikTok screenshot error
          logging.errorLogger.logError(error, {
            context: 'tiktok_screenshot',
            requestId,
            platform: postPlatform,
            url: postURL,
            operation: 'screenshot',
            errorType: error.name,
            errorMessage: error.message
          });
          throw error;
        });
        
        // Log TikTok screenshot success
        logging.apiLogger.logRequest({
          method: 'SCREENSHOT',
          url: postURL,
          context: {
            requestId,
            operation: 'tiktok_screenshot_success',
            platform: postPlatform,
            bufferSize: buffer.length
          }
        });
        
        await browserTiktok.close();
        return buffer;
      } catch (error) {
        // Log TikTok overall error
        logging.errorLogger.logError(error, {
          context: 'tiktok_screenshot_process',
          requestId,
          platform: postPlatform,
          url: postURL,
          operation: 'tiktok_screenshot',
          errorType: error.name,
          errorMessage: error.message,
          stack: error.stack
        });
        throw error;
      }
    }

    try {
      // Log content setting
      logging.apiLogger.logRequest({
        method: 'CONTENT',
        url: postURL,
        context: {
          requestId,
          operation: 'set_page_content',
          platform: postPlatform,
          contentLength: oembedResponse.html.length
        }
      });
      
      // set content on the html page
      const content = getTemplate(oembedResponse.html);
      await page.setContent(content).catch(error => {
        // Log content setting error
        logging.errorLogger.logError(error, {
          context: 'set_page_content',
          requestId,
          platform: postPlatform,
          url: postURL,
          operation: 'set_content',
          errorType: error.name,
          errorMessage: error.message
        });
        throw error;
      });

      // Log waiting for content to load
      logging.apiLogger.logRequest({
        method: 'WAIT',
        url: postURL,
        context: {
          requestId,
          operation: 'wait_for_content',
          platform: postPlatform,
          waitTime: 9000
        }
      });
      
      // wait to load css and js
      await page.waitForTimeout(9000);
      
      // Log selector waiting
      logging.apiLogger.logRequest({
        method: 'SELECTOR',
        url: postURL,
        context: {
          requestId,
          operation: 'wait_for_selector',
          platform: postPlatform,
          selector: postClass
        }
      });
      
      const selector = await page.waitForSelector(postClass).catch(error => {
        // Log selector error
        logging.errorLogger.logError(error, {
          context: 'wait_for_selector',
          requestId,
          platform: postPlatform,
          url: postURL,
          operation: 'wait_for_selector',
          selector: postClass,
          errorType: error.name,
          errorMessage: error.message
        });
        throw error;
      });

      // Log bounding box calculation
      logging.apiLogger.logRequest({
        method: 'BOUNDINGBOX',
        url: postURL,
        context: {
          requestId,
          operation: 'get_bounding_box',
          platform: postPlatform
        }
      });
      
      const bounding_box = await selector.boundingBox().catch(error => {
        // Log bounding box error
        logging.errorLogger.logError(error, {
          context: 'get_bounding_box',
          requestId,
          platform: postPlatform,
          url: postURL,
          operation: 'get_bounding_box',
          errorType: error.name,
          errorMessage: error.message
        });
        throw error;
      });
      
      console.log(bounding_box);
      
      // Log screenshot attempt
      logging.apiLogger.logRequest({
        method: 'SCREENSHOT',
        url: postURL,
        context: {
          requestId,
          operation: 'take_screenshot',
          platform: postPlatform,
          boundingBox: {
            x: bounding_box.x,
            y: bounding_box.y,
            width: Math.min(bounding_box.width, page.viewport().width),
            height: Math.min(bounding_box.height, page.viewport().height)
          }
        }
      });

      const buffer = await selector.screenshot({
        clip: {
          x: bounding_box.x,
          y: bounding_box.y,
          width: Math.min(bounding_box.width, page.viewport().width),
          height: Math.min(bounding_box.height, page.viewport().height),
        },
      }).catch(error => {
        // Log screenshot error
        logging.errorLogger.logError(error, {
          context: 'take_screenshot',
          requestId,
          platform: postPlatform,
          url: postURL,
          operation: 'screenshot',
          errorType: error.name,
          errorMessage: error.message
        });
        throw error;
      });
      
      // Log screenshot success
      logging.apiLogger.logRequest({
        method: 'SCREENSHOT',
        url: postURL,
        context: {
          requestId,
          operation: 'screenshot_success',
          platform: postPlatform,
          bufferSize: buffer.length
        }
      });

      await browser.close();
      return buffer;
    } catch (error) {
      // Ensure browser is closed in case of error
      if (browser) {
        try {
          await browser.close();
        } catch (closingError) {
          console.error('Error closing browser:', closingError);
        }
      }
      
      // Log overall screenshot error
      logging.errorLogger.logError(error, {
        context: 'screenshot_process',
        requestId,
        platform: postPlatform,
        url: postURL,
        operation: 'screenshot',
        errorType: error.name,
        errorMessage: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  } catch (error) {
    // Log top-level error
    logging.errorLogger.logError(error, {
      context: 'post_screenshot',
      platform: postPlatform,
      url: postURL,
      operation: 'screenshot',
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    
    throw error;
  }
};

module.exports = { postScreenshot };
