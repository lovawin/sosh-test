/**
 * NFT Retrieval Feature Diagnostic Script
 * 
 * This script helps diagnose issues with the NFT retrieval feature.
 * Run this script in your browser console while on the profile page.
 */

(async function() {
  console.log("%c=== NFT Retrieval Feature Diagnostic ===", "font-size: 16px; font-weight: bold; color: #4CAF50;");
  
  // 1. Check if we're on the right page
  console.log("%c1. Checking current page...", "font-weight: bold;");
  console.log("Current URL:", window.location.href);
  if (!window.location.href.includes('/my-profile')) {
    console.error("Error: Not on the profile page. Please navigate to /my-profile?owner=true");
    return;
  }
  console.log("✅ On profile page");
  
  // 2. Check if the user is logged in
  console.log("%c2. Checking login status...", "font-weight: bold;");
  const isLoggedIn = !!localStorage.getItem('token') || !!sessionStorage.getItem('token') || !!window.ethereum;
  console.log("User logged in:", isLoggedIn);
  if (!isLoggedIn) {
    console.error("Error: User not logged in. Please connect your wallet.");
    return;
  }
  console.log("✅ User is logged in");
  
  // 3. Check if Web3 is available
  console.log("%c3. Checking Web3 availability...", "font-weight: bold;");
  if (typeof window.ethereum === 'undefined') {
    console.error("Error: Web3 not available. Please install MetaMask.");
    return;
  }
  console.log("✅ Web3 is available");
  
  // 4. Get the user's address
  console.log("%c4. Getting user address...", "font-weight: bold;");
  let userAddress;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    userAddress = accounts[0];
    console.log("User address:", userAddress);
  } catch (error) {
    console.error("Error getting user address:", error);
    return;
  }
  console.log("✅ Got user address");
  
  // 5. Check for NFT cards on the page
  console.log("%c5. Looking for NFT cards...", "font-weight: bold;");
  const nftCards = document.querySelectorAll('.post-image-wrapper');
  console.log("NFT cards found:", nftCards.length);
  if (nftCards.length === 0) {
    console.error("Error: No NFT cards found on the page.");
    return;
  }
  console.log("✅ Found NFT cards");
  
  // 6. Check for specific NFTs (tokens 1 and 2)
  console.log("%c6. Looking for specific NFTs (tokens 1 and 2)...", "font-weight: bold;");
  const targetTokenIds = ['1', '2'];
  console.log("Looking for NFTs with token IDs:", targetTokenIds);
  
  // 7. Extract data from NFT cards
  console.log("%c7. Extracting data from NFT cards...", "font-weight: bold;");
  const nftData = [];
  
  // Try to find token IDs in various ways
  document.querySelectorAll('*').forEach(el => {
    // Check for data attributes
    if (el.dataset && el.dataset.tokenId) {
      nftData.push({
        element: el,
        tokenId: el.dataset.tokenId,
        source: 'data-token-id attribute'
      });
    }
    
    // Check for token ID in text content
    if (el.textContent && el.textContent.includes('Token ID:')) {
      const match = el.textContent.match(/Token ID:\s*(\d+)/);
      if (match && match[1]) {
        nftData.push({
          element: el,
          tokenId: match[1],
          source: 'text content'
        });
      }
    }
    
    // Check for token ID in element ID
    if (el.id && el.id.includes('token-')) {
      const match = el.id.match(/token-(\d+)/);
      if (match && match[1]) {
        nftData.push({
          element: el,
          tokenId: match[1],
          source: 'element ID'
        });
      }
    }
  });
  
  console.log("NFT data found:", nftData);
  
  // 8. Check React component props
  console.log("%c8. Examining React component props...", "font-weight: bold;");
  
  // Find all React component instances
  const reactInstances = [];
  const findReactComponents = (element) => {
    const keys = Object.keys(element);
    const reactKey = keys.find(key => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$'));
    
    if (reactKey) {
      let fiber = element[reactKey];
      if (fiber) {
        reactInstances.push({
          element,
          fiber
        });
      }
    }
    
    // Check children
    if (element.children && element.children.length > 0) {
      Array.from(element.children).forEach(child => findReactComponents(child));
    }
  };
  
  // Start from the root
  findReactComponents(document.body);
  console.log("React instances found:", reactInstances.length);
  
  // 9. Check for PostCard components
  console.log("%c9. Looking for PostCard components...", "font-weight: bold;");
  const postCardComponents = reactInstances.filter(instance => {
    // Try to find PostCard components
    const fiber = instance.fiber;
    let current = fiber;
    
    // Traverse up the fiber tree
    while (current) {
      if (current.type && typeof current.type === 'function' && current.type.name === 'PostCard') {
        return true;
      }
      current = current.return;
    }
    
    return false;
  });
  
  console.log("PostCard components found:", postCardComponents.length);
  
  // 10. Check for expired listings
  console.log("%c10. Checking for expired listings...", "font-weight: bold;");
  const now = Math.floor(Date.now() / 1000);
  console.log("Current timestamp:", now);
  
  // 11. Extract data from the Redux store if available
  console.log("%c11. Checking Redux store...", "font-weight: bold;");
  let reduxState = null;
  
  // Try to find Redux store
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log("Redux DevTools detected, attempting to access state");
    try {
      reduxState = window.__REDUX_DEVTOOLS_EXTENSION__.liftedState.computedStates.slice(-1)[0].state;
      console.log("Redux state:", reduxState);
    } catch (error) {
      console.log("Could not access Redux state:", error);
    }
  } else {
    console.log("Redux DevTools not detected");
  }
  
  // 12. Check if the marketplace contract owns the NFTs
  console.log("%c12. Checking NFT ownership...", "font-weight: bold;");
  const MARKETPLACE_ADDRESS = "0x25ad5b58a78c1cC1aF3C83607448D0D203158F06";
  console.log("Marketplace address:", MARKETPLACE_ADDRESS);
  
  // 13. Check for saleId in the data
  console.log("%c13. Checking for saleId in the data...", "font-weight: bold;");
  
  // 14. Check if the isExpired state is being set correctly
  console.log("%c14. Checking if isExpired state is being set correctly...", "font-weight: bold;");
  
  // 15. Check if the deployment was successful
  console.log("%c15. Checking if deployment was successful...", "font-weight: bold;");
  
  // 16. Check for any JavaScript errors in the console
  console.log("%c16. Checking for JavaScript errors...", "font-weight: bold;");
  
  // 17. Examine the DOM for button elements
  console.log("%c17. Examining DOM for button elements...", "font-weight: bold;");
  const buttons = document.querySelectorAll('button');
  console.log("Buttons found:", buttons.length);
  
  // Check for "List / Sell" buttons
  const listSellButtons = Array.from(buttons).filter(button => 
    button.textContent.includes('List') || 
    button.textContent.includes('Sell')
  );
  console.log("List/Sell buttons found:", listSellButtons.length);
  
  // Check for "Retrieve" buttons
  const retrieveButtons = Array.from(buttons).filter(button => 
    button.textContent.includes('Retrieve')
  );
  console.log("Retrieve buttons found:", retrieveButtons.length);
  
  // 18. Try to manually check the conditions for showing the Retrieve button
  console.log("%c18. Manually checking conditions for Retrieve button...", "font-weight: bold;");
  
  // Get all NFT card containers
  const nftContainers = document.querySelectorAll('.StyledPostCard');
  console.log("NFT containers found:", nftContainers.length);
  
  // Check each container
  nftContainers.forEach((container, index) => {
    console.log(`NFT #${index + 1}:`);
    
    // Check for token ID
    const tokenIdElement = container.querySelector('[data-token-id]');
    const tokenId = tokenIdElement ? tokenIdElement.getAttribute('data-token-id') : 'Unknown';
    console.log(`- Token ID: ${tokenId}`);
    
    // Check for buttons
    const containerButtons = container.querySelectorAll('button');
    console.log(`- Buttons: ${containerButtons.length}`);
    
    // Check button text
    const buttonTexts = Array.from(containerButtons).map(button => button.textContent.trim());
    console.log(`- Button texts: ${buttonTexts.join(', ')}`);
    
    // Check if this is one of our target NFTs
    if (targetTokenIds.includes(tokenId)) {
      console.log(`- This is one of our target NFTs (Token ID: ${tokenId})`);
      console.log(`- Has Retrieve button: ${buttonTexts.includes('Retrieve') || buttonTexts.includes('Retrieving...')}`);
    }
  });
  
  // 19. Summary of findings
  console.log("%c=== Diagnostic Summary ===", "font-size: 16px; font-weight: bold; color: #4CAF50;");
  console.log("- User logged in:", isLoggedIn);
  console.log("- User address:", userAddress);
  console.log("- NFT cards found:", nftCards.length);
  console.log("- PostCard components found:", postCardComponents.length);
  console.log("- List/Sell buttons found:", listSellButtons.length);
  console.log("- Retrieve buttons found:", retrieveButtons.length);
  
  // 20. Recommendations
  console.log("%c=== Recommendations ===", "font-size: 16px; font-weight: bold; color: #4CAF50;");
  console.log("1. Check the browser console for any JavaScript errors");
  console.log("2. Verify the NFT ownership on the blockchain");
  console.log("3. Check if the listings are actually expired");
  console.log("4. Verify if the saleId is present in the data");
  console.log("5. Try running the test-retrieve-nft.js script to verify the backend functionality");
  
  console.log("%c=== End of Diagnostic ===", "font-size: 16px; font-weight: bold; color: #4CAF50;");
})();
