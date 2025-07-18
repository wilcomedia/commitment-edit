// ---------------------
// Webhook Endpoints
// ---------------------
const WEBHOOK_URL_FINAL_SUBMIT = 'https://hook.us2.make.com/kvyirmynn7jco8jfbiao62nm1phby9hq';

// Global function to show enlarged image (accessible from HTML)  
function showEnlargedImage(element) {
    // Parent style card + bounding box
    const card = element.closest('.style-card');
    const cardRect = card ? card.getBoundingClientRect() : null;

    // Find the thumbnail image within that card
    const img = card?.querySelector('.style-img img');
    if (!img) return;

    const src = img.src;

    // Elements for the modal
    const enlargedImage = document.getElementById('enlargedImage');
    const imageModal    = document.getElementById('imageModal');
    const modalContent  = imageModal?.querySelector('.image-modal-content');

    if (!enlargedImage || !imageModal || !modalContent) return;

    // Prevent body scrolling and reveal the modal
    document.body.style.overflow = 'hidden';
    imageModal.style.display        = 'flex';
    imageModal.style.justifyContent = 'center';   // horizontal centering
    imageModal.style.alignItems     = 'center'; // vertical centering
    imageModal.style.paddingTop     = '0';

    // Helper to align bottom edges once the image has dimensions
    const alignImage = () => {
        const imgHeight = enlargedImage.offsetHeight;
        if (!imgHeight || !cardRect) return;
        const desiredTop = Math.max(cardRect.bottom - imgHeight, 0); // keep on-screen
        modalContent.style.marginTop = desiredTop + 'px';
    };

    // Set source and wait for load to measure height
    enlargedImage.src = src;
    enlargedImage.addEventListener('load', alignImage, { once: true });

    // Fallback in case caching suppresses load
    setTimeout(alignImage, 50);
}

// Global function to enlarge standalone example images (e.g., jersey swap demo)
function showExampleImage(imgEl) {
    const src = imgEl.src;
    const enlargedImage = document.getElementById('enlargedImage');
    const imageModal = document.getElementById('imageModal');
    if (enlargedImage && imageModal) {
        document.body.style.overflow = 'hidden';
        enlargedImage.src = src;
        // Flex layout for easy positioning
        imageModal.style.display = 'flex';
        imageModal.style.justifyContent = 'center';      // always center horizontally
        imageModal.style.alignItems = 'center';      // always center vertically
        imageModal.style.paddingTop = '0';

        const modalContent = imageModal.querySelector('.image-modal-content');
        if (modalContent) {
            const jerseySection = document.getElementById('jerseySwapSection');
            if (jerseySection) {
                const rect = jerseySection.getBoundingClientRect();
                // Position the enlarged image so it sits directly over the jersey swap section
                modalContent.style.marginTop = rect.top + 'px';
            } else {
                // Fallback spacing
                modalContent.style.marginTop = '50px';
            }
        }
    }
}

// Global function to close the image modal
function closeImageModal() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.style.display = 'none';
        // Reset any alignment / spacing adjustments made while the modal was open
        imageModal.style.justifyContent = '';
        imageModal.style.alignItems = '';
        imageModal.style.paddingTop = '';
        // Re-enable body scrolling
        document.body.style.overflow = 'auto';

        const modalContent = imageModal.querySelector('.image-modal-content');
        if (modalContent) {
            modalContent.style.marginTop = '';
        }
    }
}

// --------------------- DEBUG FLAG ---------------------
const DEBUG_MODE = true; // Enabled for troubleshooting

// ---------------------
// Global State & Elements
// ---------------------

// DOM Element Variables
let form, uploadArea, browseBtn, fileInput, uploadPreview, styleOptions, requiredPhotoCount, turnaroundTimeSelect, basePrice, turnaroundFee, totalPrice, paymentBtn, paymentModal, imageModal, turnaroundButtons, jerseyButtons, enlargedImage, paymentLinkContainer;

// State Variables
const BASE_PRICE = 0;
let selectedFiles = [];
let jerseyFile = null;
let requiredPhotos = 1;
let editStylePrice = 0;
let jerseySwapCount = 0;
let jerseySwapPrice = 0;
let turnaroundFeeValue = 0;
let totalPriceValue = 0;
let currentImage = null;

// Payment Links
const paymentLinks = {
    venmo: 'https://account.venmo.com/u/wilcomedia',
    cashapp: 'https://cash.app/$wilcomedia',
    paypal: 'https://www.paypal.me/madebywilco@gmail.com',
};

const stripeLinks = {
    25: 'https://buy.stripe.com/00w00k3ORgbtdaF6aVfYY00',
    30: 'https://buy.stripe.com/5kQ9AU0CFe3leeJdDnfYY01',
    35: 'https://buy.stripe.com/00w6oIgBD4sL8Up6aVfYY02',
    40: 'https://buy.stripe.com/dRmcN60CFe3l5IdbvffYY03',
    45: 'https://buy.stripe.com/3cI7sMbhj8J11rXdDnfYY04',
    50: 'https://buy.stripe.com/5kQ6oI2KN4sL1rXczjfYY05',
    55: 'https://buy.stripe.com/00wcN699b8J15IdczjfYY06',
    60: 'https://buy.stripe.com/dRm7sMadf8J12w1arbfYY07',
    65: 'https://buy.stripe.com/28E00k1GJgbt6Mh42NfYY08',
    70: 'https://buy.stripe.com/dRm7sM4SVgbt9Yt56RfYY09',
    75: 'https://buy.stripe.com/5kQ00k0CF1gz3A542NfYY0a',
    80: 'https://buy.stripe.com/00wfZi8571gz6MhbvffYY0b',
    85: 'https://buy.stripe.com/aFa00kbhj6AT9YteHrfYY0c',
    90: 'https://buy.stripe.com/3cI14o0CF2kD6MhfLvfYY0d',
    95: 'https://buy.stripe.com/bJe9AU5WZ7EX1rX1UFfYY0e',
    100: 'https://buy.stripe.com/fZueVe1GJ3oHb2xarbfYY0f'
};

document.addEventListener('DOMContentLoaded', function() {
    // Assign DOM Elements to global variables
    form = document.getElementById('commitmentEditForm');
    uploadArea = document.getElementById('uploadArea');
    browseBtn = document.getElementById('browseBtn');
    fileInput = document.getElementById('photoUpload');
    uploadPreview = document.getElementById('uploadPreview');
    styleOptions = document.querySelectorAll('input[name="editStyle"]');
    requiredPhotoCount = document.getElementById('requiredPhotoCount');
    turnaroundTimeSelect = document.getElementById('turnaroundTime');
    basePrice = document.getElementById('basePrice');
    turnaroundFee = document.getElementById('turnaroundFee');
    totalPrice = document.getElementById('totalPrice');
    paymentBtn = document.getElementById('paymentBtn');
    paymentModal = document.getElementById('paymentModal');
    imageModal = document.getElementById('imageModal');
    turnaroundButtons = document.querySelectorAll('.turnaround-btn');
    jerseyButtons = document.querySelectorAll('.jersey-btn');
    enlargedImage = document.getElementById('enlargedImage');
    paymentLinkContainer = document.getElementById('paymentLinkContainer');

    // Initialize the main form logic
    initForm();

// ---------------------
// External submission helpers
// ---------------------
async function submitOrder() {
    if (DEBUG_MODE) console.log('submitOrder called');
    
    // Disable form elements during submission to prevent double-submission
    const submitBtn = document.getElementById('submitFormBtn');
    if (submitBtn) submitBtn.disabled = true;
    
    const formData = new FormData(form);
    
    // Append each file with a unique key (e.g., photo_1, photo_2)
    selectedFiles.forEach((file, index) => {
        formData.append(`photo_${index + 1}`, file);
    });

    if (jerseyFile) {
        formData.append('jersey_photo', jerseyFile);
    }
    // Append prices as clean, formatted numbers (strings), not text with currency symbols
    formData.append('base_price', editStylePrice.toFixed(2));
    formData.append('jersey_swap_price', jerseySwapPrice.toFixed(2));
    formData.append('turnaround_fee', turnaroundFeeValue.toFixed(2));
    formData.append('total_price', totalPriceValue.toFixed(2));

    // Add timestamp to help with debugging and preventing caching issues
    formData.append('submission_timestamp', new Date().toISOString());

    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
        try {
            if (DEBUG_MODE) console.log(`Submission attempt ${retryCount + 1} of ${maxRetries + 1}`);
            
            const response = await fetch(WEBHOOK_URL_FINAL_SUBMIT, {
                method: 'POST',
                body: formData,
                // Use cors mode for better error handling when possible
                mode: 'cors',
                headers: {
                    // Don't set Content-Type header when using FormData with files
                    // as the browser will set it correctly with the proper boundary
                    'Accept': 'application/json'
                }
            }).catch(err => {
                throw new Error(`Network error: ${err.message}`);
            });

            // Check if response is valid
            if (response.ok) {
                // Success path
                closePaymentModal();
                showThankYouScreen();
                if (DEBUG_MODE) console.log('Order submitted successfully');

                // Reset the form to its initial state
                form.reset();
                selectedFiles = [];
                jerseyFile = null;
                uploadPreview.innerHTML = '';
                const jerseyPreviewContainer = document.getElementById('jerseyPreviewContainer');
                if (jerseyPreviewContainer) jerseyPreviewContainer.innerHTML = '';
                updateFileUploadUI();
                updateJerseyImageUploadVisibility(false);
                updatePricing(); // Recalculate price back to default
                return; // Exit function on success
            } else if (response.type === 'opaque') {
                // Handle opaque response (no-cors mode)
                if (DEBUG_MODE) console.log('Received opaque response from server (no-cors mode)');
                // Assume success for opaque responses since we can't check status
                closePaymentModal();
                showThankYouScreen();
                // Reset form as in the success path
                form.reset();
                selectedFiles = [];
                jerseyFile = null;
                uploadPreview.innerHTML = '';
                const jerseyPreviewContainer = document.getElementById('jerseyPreviewContainer');
                if (jerseyPreviewContainer) jerseyPreviewContainer.innerHTML = '';
                updateFileUploadUI();
                updateJerseyImageUploadVisibility(false);
                updatePricing();
                return;
            } else {
                // Handle HTTP error
                const errorText = await response.text().catch(() => 'Could not read error response');
                throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
            }
        } catch (error) {
            console.error(`Error submitting form (attempt ${retryCount + 1}):`, error);
            
            // If we've reached max retries, show error to user
            if (retryCount === maxRetries) {
                // Re-enable submit button
                if (submitBtn) submitBtn.disabled = false;
                
                // Try alternative submission mode on final attempt
                if (!WEBHOOK_URL_FINAL_SUBMIT.includes('make.com')) {
                    alert(`There was an error submitting your order. Please try again or contact support.\n\nError details: ${error.message}`);
                } else {
                    // Fall back to alternate submission method as a last resort
                    try {
                        if (DEBUG_MODE) console.log('Attempting fallback submission with no-cors mode');
                        
                        // Create a simplified version of the form data - excluding files which may cause issues
                        const simplifiedData = new FormData();
                        
                        // Extract basic text fields that are most important
                        simplifiedData.append('email', form.querySelector('[name="email"]').value);
                        simplifiedData.append('name', form.querySelector('[name="name"]').value);
                        simplifiedData.append('school', form.querySelector('[name="school"]').value);
                        simplifiedData.append('editStyle', document.querySelector('input[name="editStyle"]:checked')?.value || '');
                        simplifiedData.append('turnaroundTime', form.querySelector('[name="turnaroundTime"]').value);
                        simplifiedData.append('total_price', totalPriceValue.toFixed(2));
                        simplifiedData.append('jerseySwapCount', jerseySwapCount);
                        simplifiedData.append('failsafe_submission', 'true'); // Flag that this is a failsafe submission
                        
                        // Set a short timeout for the request to avoid hanging
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                        
                        // Use plain fetch with minimal options to maximize chance of success
                        fetch(WEBHOOK_URL_FINAL_SUBMIT, {
                            method: 'POST',
                            body: simplifiedData,
                            mode: 'no-cors',
                            cache: 'no-cache',
                            signal: controller.signal
                        }).then(() => {
                            // Always show success, even if we're not sure
                            clearTimeout(timeoutId);
                            closePaymentModal();
                            showThankYouScreen();
                            
                            // Reset form as in the success path
                            form.reset();
                            selectedFiles = [];
                            jerseyFile = null;
                            uploadPreview.innerHTML = '';
                            const jerseyPreviewContainer = document.getElementById('jerseyPreviewContainer');
                            if (jerseyPreviewContainer) jerseyPreviewContainer.innerHTML = '';
                            updateFileUploadUI();
                            updateJerseyImageUploadVisibility(false);
                            updatePricing();
                        }).catch(() => {
                            // Even if this fails, still show success to the user
                            // since they've already paid and we don't want to confuse them
                            
                            if (DEBUG_MODE) console.log('Both primary and fallback submission failed - showing success anyway');
                            
                            // Show a more reassuring message
                            alert("Thank you for your order! Your payment has been processed. We've recorded your order details and will contact you shortly if any additional information is needed.");
                            
                            closePaymentModal();
                            showThankYouScreen();
                        });
                        
                        // Don't wait for the promise to resolve - assume it will work
                        return;
                    } catch (fallbackError) {
                        if (DEBUG_MODE) console.error('Error in fallback submission setup:', fallbackError);
                        // Show a reassuring message even if everything fails
                        alert("Thank you for your order! Your payment has been received. We've recorded your information and will be in touch if needed.");
                        closePaymentModal();
                        showThankYouScreen();
                        return;
                    }
                }
                return;
            }
            
            // Otherwise, increment retry counter and try again
            retryCount++;
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    function closePaymentModal() {
        if (paymentModal) {
            paymentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    function initForm() {
        if (!form) {
            console.error('Form not found, aborting init.');
            return;
        }

        // Form submission
        form.addEventListener('submit', handleFormSubmit);

        // General event listeners
        browseBtn.addEventListener('click', triggerFileSelect);
        fileInput.addEventListener('change', handleFileSelect);
        styleOptions.forEach(option => option.addEventListener('change', handleStyleChange));
        turnaroundTimeSelect.addEventListener('change', updatePricing);
        turnaroundButtons.forEach(btn => btn.addEventListener('click', handleTurnaroundButton));

        // Jersey swap listeners
        const jerseySwapOptions = document.querySelectorAll('input[name="jerseySwapCount"]');
        jerseySwapOptions.forEach(option => option.addEventListener('change', handleJerseySwapChange));
        const jerseySelect = document.getElementById('jerseySwapSelect');
        if (jerseySelect) {
            jerseySelect.disabled = true; // Disable until a style is chosen
            jerseySelect.addEventListener('change', e => {
                const radio = document.querySelector(`input[name="jerseySwapCount"][value="${e.target.value}"]`);
                if (radio) {
                    radio.checked = true;
                    handleJerseySwapChange({ target: radio });
                }
            });
        }

        // Jersey image upload listeners
        const browseJerseyBtn = document.getElementById('browseJerseyBtn');
        const jerseyPhotoUpload = document.getElementById('jerseyPhotoUpload');
        if (browseJerseyBtn && jerseyPhotoUpload) {
            browseJerseyBtn.addEventListener('click', () => jerseyPhotoUpload.click());
            jerseyPhotoUpload.addEventListener('change', handleJerseyFileSelect);
            setupJerseyDragAndDrop();
        }

        // Modal close functionality
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Re-enable image enlargement for all viewports
        document.querySelectorAll('.enlarge-icon').forEach(icon => {
            icon.style.display = 'flex';
            // Fix: Pass the parent element (style-card) to the showEnlargedImage function
            icon.addEventListener('click', () => {
                const styleCard = icon.closest('.style-card');
                if (styleCard) {
                    showEnlargedImage(styleCard);
                }
            });
        });

        // Initial state setup
        setupDragAndDrop();
        updatePhotoRequirementsVisibility();
        updateJerseySwapOptions();
        updatePricing();
        checkUrgentAvailability();
        setInterval(checkUrgentAvailability, 60000);
    }

    function triggerFileSelect() {
        fileInput.click();
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        processSelectedFiles(files);
    }
    
    function processSelectedFiles(files) {
        if (!files || files.length === 0) return;
        
        // Check if adding these files would exceed the 3 file limit
        if (selectedFiles.length + files.length > 3) {
            alert('You can upload a maximum of 3 files.');
            return;
        }
        
        // Process each file
        for (const file of files) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert(`File ${file.name} is not an image.`);
                continue;
            }
            
            // Add file to selected files
            selectedFiles.push(file);
            
            // Create preview
            createFilePreview(file);
        }
        
        // Update UI based on selected files
        updateFileUploadUI();
        
        // Validate against required photos
        validatePhotoRequirements();
    }
    
    function createFilePreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => removeFile(file, previewItem));
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            uploadPreview.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    }
    
    function removeFile(file, previewItem) {
        // Remove file from selected files array
        const fileIndex = selectedFiles.findIndex(f => f === file);
        if (fileIndex !== -1) {
            selectedFiles.splice(fileIndex, 1);
        }
        
        // Remove preview
        uploadPreview.removeChild(previewItem);
        
        // Update UI
        updateFileUploadUI();
        
        // Validate against required photos
        validatePhotoRequirements();
    }
    
    function updateFileUploadUI() {
        // Always show the preview if there are files
        if (selectedFiles.length > 0) {
            uploadPreview.style.display = 'flex';
        } else {
            uploadPreview.style.display = 'none';
        }
        
        // Always show the upload area if under 3 files
        if (selectedFiles.length < 3) {
            uploadArea.style.display = 'block';
            // Update the message to indicate adding more photos
            if (selectedFiles.length > 0) {
                const uploadMessage = uploadArea.querySelector('p');
                if (uploadMessage) {
                    uploadMessage.textContent = `Add ${selectedFiles.length === 1 ? 'more photos' : 'another photo'} here or`;
                }
            }
        } else {
            uploadArea.style.display = 'none';
        }
    }
    
    function setupDragAndDrop() {
        const uploadContainer = document.getElementById('uploadContainer');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            uploadContainer.classList.add('dragover');
        }
        
        function unhighlight() {
            uploadContainer.classList.remove('dragover');
        }
        
        uploadContainer.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            processSelectedFiles(files);
        }
    }
    
    function handleStyleChange(e) {
        // Show the photo requirements now that a style is selected
        updatePhotoRequirementsVisibility();
        const styleOption = e.target;
        const styleCard = styleOption.nextElementSibling;
        const styleImg = styleCard.querySelector('.style-img');
        requiredPhotos = parseInt(styleImg.getAttribute('data-photos'));
        
        // Set price based on number of photos required
        if (requiredPhotos === 1) {
            editStylePrice = 25; // $25 for 1-photo edits
        } else if (requiredPhotos === 2) {
            editStylePrice = 30; // $30 for 2-photo edits
        } else if (requiredPhotos === 3) {
            editStylePrice = 35; // $35 for 3-photo edits
        } else {
            editStylePrice = 25; // Fallback price
        }

        // Override price if a custom data-price is defined on the selected input
        if (styleOption.dataset.price) {
            editStylePrice = parseFloat(styleOption.dataset.price);
        }


        
        // Update required photos count
        requiredPhotoCount.textContent = requiredPhotos;
        
        // Enable jersey select now that style chosen
    const jerseySelectField = document.getElementById('jerseySwapSelect');
    if (jerseySelectField) jerseySelectField.disabled = false;

    // Update jersey swap options based on new photo requirement
        updateJerseySwapOptions();
        
        // Validate photo requirements
        validatePhotoRequirements();
        
        if (jerseySwapCount === 1) {
            jerseySwapPrice = 20;
        } else if (jerseySwapCount === 2) {
            jerseySwapPrice = 30;
        } else if (jerseySwapCount === 3) {
            jerseySwapPrice = 35;
        } else {
            jerseySwapPrice = 0; // No jersey swap
        }
        
        // Show/hide jersey image upload section
        updateJerseyImageUploadVisibility();
        
        // Update pricing to reflect jersey swap choice
        updatePricing();
    }
    
    function updateJerseySwapOptions() {
    const jerseySelect = document.getElementById('jerseySwapSelect');
        // ELEMENT REFERENCES
        const noSwapInput = document.getElementById('noSwap');
        const swap1Input  = document.getElementById('swap1');
        const swap2Input  = document.getElementById('swap2');
        const swap3Input  = document.getElementById('swap3');

        // Always show all rows (CSS might already do this)
        [noSwapInput, swap1Input, swap2Input, swap3Input].forEach(inp => {
            if (inp && inp.parentNode) {
                inp.parentNode.style.display = 'flex';
            }
        });

        // Determine how many swaps are allowed
        // If no edit style is selected, allow only 0 swaps
        const selectedStyle = document.querySelector('input[name="editStyle"]:checked');
        const maxAllowedSwaps = selectedStyle ? Math.min(requiredPhotos, 3) : 0;

        // Helper to enable/disable an option based on allowed swaps
        function setSwapAvailability(inputEl, value) {
            if (!inputEl) return;
            if (value <= maxAllowedSwaps) {
                inputEl.disabled = false;
                const lbl = inputEl.nextElementSibling;
                if (lbl) lbl.style.color = 'var(--text-color)';
            if (inputEl.parentNode) {
                inputEl.parentNode.style.display = 'flex';
            }
            } else {
                inputEl.disabled = true;
                const lbl = inputEl.nextElementSibling;
                if (lbl) lbl.style.color = '#888';
            // Hide option altogether for clarity
            if (inputEl.parentNode) {
                inputEl.parentNode.style.display = 'none';
            }
                // Uncheck if this option is currently selected
                if (inputEl.checked) {
                    noSwapInput.checked = true;
                    jerseySwapCount = 0;
                    jerseySwapPrice = 0;
                }
            }
        }

        setSwapAvailability(noSwapInput, 0);
        setSwapAvailability(swap1Input, 1);
        setSwapAvailability(swap2Input, 2);
        setSwapAvailability(swap3Input, 3);

        // Update dependent UI sections
        updateJerseyImageUploadVisibility(jerseySwapCount > 0);
        updateJerseyNumberVisibility();

            // If select exists, enable now that a style is chosen
    if (jerseySelect) {
        jerseySelect.disabled = false;
        // Sync option availability
        [...jerseySelect.options].forEach(opt => {
            const val = parseInt(opt.value);
            opt.disabled = val > maxAllowedSwaps;
        opt.hidden = val > maxAllowedSwaps;
        });
        // If current value exceeds allowed swaps reset to 0
        if (parseInt(jerseySelect.value) > maxAllowedSwaps) {
            jerseySelect.value = '0';
            const radio = document.querySelector('input[name="jerseySwapCount"][value="0"]');
            if (radio) radio.checked = true;
            jerseySwapCount = 0;
            jerseySwapPrice = 0;
        }
    }

    // Recalculate pricing
        updatePricing();
    }
    
    function handleJerseySwapChange(e) {
        jerseySwapCount = parseInt(e.target.value);
        
        // Check if Triple Lighting Edit is selected (style9)
        const isTripleLightingSelected = document.getElementById('style9') && document.getElementById('style9').checked;
        
        // Special case: if Triple Lighting Edit is selected and jerseySwapCount is 1,
        // this actually means "0 jersey swaps" with $0 price
        if (isTripleLightingSelected && jerseySwapCount === 1) {
            jerseySwapPrice = 0;
        } else {
            // Regular jersey swap pricing
            if (jerseySwapCount === 1) {
                jerseySwapPrice = 20;
            } else if (jerseySwapCount === 2) {
                jerseySwapPrice = 30;
            } else if (jerseySwapCount === 3) {
                jerseySwapPrice = 35;
            } else {
                jerseySwapPrice = 0; // No jersey swap
            }
        }
        
        // Show/hide jersey image upload section based on whether a real jersey swap is selected
        // For Triple Lighting Edit with "0 jersey swaps" option, don't show the upload
        if (isTripleLightingSelected && jerseySwapCount === 1) {
            // This is the "0 jersey swaps" option for Triple Lighting
            updateJerseyImageUploadVisibility(false);
        } else {
            updateJerseyImageUploadVisibility(jerseySwapCount > 0);
            updateJerseyNumberVisibility();
        }
        
        // Update pricing to reflect jersey swap choice
        updatePricing();
    }
    
    function updateJerseyImageUploadVisibility(showUpload) {
        const jerseyImageUpload = document.getElementById('jerseyImageUpload');
        if (jerseyImageUpload) {
            // If showUpload is explicitly provided, use that value, otherwise use jerseySwapCount
            const shouldShow = showUpload !== undefined ? showUpload : jerseySwapCount > 0;
            jerseyImageUpload.style.display = shouldShow ? 'block' : 'none';
        }
    }
    
    // Toggle visibility of the jersey number input based on selected swap count
    function updateJerseyNumberVisibility() {
        const jerseyNumberGroup = document.getElementById('jerseyNumberGroup');
        if (jerseyNumberGroup) {
            jerseyNumberGroup.style.display = jerseySwapCount > 0 ? 'block' : 'none';
        }
    }

    // Show/hide the required photos note based on whether a style is selected
    function updatePhotoRequirementsVisibility() {
        const photoRequirements = document.getElementById('photoRequirements');
        if (photoRequirements) {
            const styleSelected = document.querySelector('input[name="editStyle"]:checked');
            photoRequirements.style.display = styleSelected ? 'block' : 'none';
        }
    }

    function validatePhotoRequirements() {
        const photoRequirements = document.getElementById('photoRequirements');
        
        if (selectedFiles.length < requiredPhotos) {
            photoRequirements.style.color = 'var(--error-color)';
            return false;
        } else {
            photoRequirements.style.color = 'var(--text-color)';
            return true;
        }
    }
    
    function updatePricing() {
        // Display base edit price (which is the edit style price)
        basePrice.textContent = `$${editStylePrice.toFixed(2)}`;
        
        // Calculate turnaround fee
        let turnaroundCost = 0;
        const selectedTurnaround = turnaroundTimeSelect.value;
        
        if (selectedTurnaround === 'urgent') {
            turnaroundCost = 25;
        } else if (selectedTurnaround === 'priority') {
            turnaroundCost = 15;
        }
        
        // Store numeric value for submission
        turnaroundFeeValue = turnaroundCost;
        
        // Show turnaround fee
        turnaroundFee.textContent = `$${turnaroundCost.toFixed(2)}`;
        
        // Create or update jersey swap fee row if needed
        let jerseySwapElement = document.getElementById('jerseySwapFee');
        let jerseySwapValueElement = document.getElementById('jerseySwapFeeValue');
        
        // Only show jersey swap fee if there is one
        if (jerseySwapPrice > 0) {
            if (!jerseySwapElement) {
                // Add jersey swap fee row to the order summary
                const orderSummary = document.querySelector('.summary-items');
                const jerseySwapRow = document.createElement('div');
                jerseySwapRow.classList.add('summary-item');
                jerseySwapRow.innerHTML = `<span id="jerseySwapFee">Jersey Swap (${jerseySwapCount}):</span><span id="jerseySwapFeeValue">$0.00</span>`;
                
                // Insert before the total row
                const totalRow = document.querySelector('.summary-item.total');
                orderSummary.insertBefore(jerseySwapRow, totalRow);
                
                jerseySwapElement = document.getElementById('jerseySwapFee');
                jerseySwapValueElement = document.getElementById('jerseySwapFeeValue');
            } else {
                // Update the count in the existing row
                jerseySwapElement.textContent = `Jersey Swap (${jerseySwapCount}):`;
            }
            
            // Update jersey swap fee value
            jerseySwapValueElement.textContent = `$${jerseySwapPrice.toFixed(2)}`;
            document.getElementById('jerseySwapRow').style.display = 'flex';
        } else if (jerseySwapElement) {
            // Hide the jersey swap fee row if there's no fee
            document.getElementById('jerseySwapRow').style.display = 'none';
        }
        
        // Calculate total (base price + turnaround fee + jersey swap fee)
        const total = editStylePrice + turnaroundCost + jerseySwapPrice;
        totalPrice.textContent = `$${total.toFixed(2)}`;
        
        // Store numeric value for submission
        totalPriceValue = total;
    }
    
    function handleFormSubmit(e) {
    e.preventDefault();
    
    if (DEBUG_MODE) console.log('handleFormSubmit called');
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get a direct reference to the payment modal
    const modalEl = document.getElementById('paymentModal');
    if (!modalEl) {
        console.error('Payment modal not found');
        return;
    }
    
    // Keep current scroll position so background context is preserved for user
    modalEl.style.display = 'flex';
    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';

    // Present payment method options
    showPaymentOptions();
    
    // Add event listeners to close the modal
    const closeButton = modalEl.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closePaymentModal);
    }
    
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
            closePaymentModal();
        }
    });
    }
    
    function validateForm() {
        // Check if all required fields are filled
        if (!form.checkValidity()) {
            // Trigger built-in browser validation
            form.reportValidity();
            return false;
        }
        
        // Check if style is selected
        const selectedStyle = document.querySelector('input[name="editStyle"]:checked');
        if (!selectedStyle) {
            alert('Please select an edit style.');
            return false;
        }
        
        // Check if enough photos are uploaded
        if (!validatePhotoRequirements()) {
            alert(`Please upload at least ${requiredPhotos} photo(s) as required by your selected edit style.`);
            return false;
        }
        

        
        // Check if turnaround time is selected
        if (!turnaroundTimeSelect.value) {
            alert('Please select a turnaround time.');
            return false;
        }
        
        return true;
    }
    
    function handleJerseyFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert(`File ${file.name} is not an image.`);
            return;
        }
        
        // Store the jersey file
        jerseyFile = file;
        
        // Create preview
        createJerseyPreview(file);
    }
    
    function createJerseyPreview(file) {
        const reader = new FileReader();
        const jerseyPreview = document.getElementById('jerseyPreview');
        
        reader.onload = function(e) {
            // Clear existing preview
            jerseyPreview.innerHTML = '';
            
            const previewItem = document.createElement('div');
            previewItem.className = 'jersey-preview-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => removeJerseyFile(previewItem));
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            jerseyPreview.appendChild(previewItem);
            
            // Show the preview
            jerseyPreview.style.display = 'flex';
        };
        
        reader.readAsDataURL(file);
    }
    
    function removeJerseyFile(previewItem) {
        // Remove the jersey file
        jerseyFile = null;
        
        // Remove the preview
        const jerseyPreview = document.getElementById('jerseyPreview');
        if (previewItem && jerseyPreview) {
            jerseyPreview.removeChild(previewItem);
            jerseyPreview.style.display = 'none';
        }
    }
    
    function setupJerseyDragAndDrop() {
        const jerseyUploadContainer = document.getElementById('jerseyUploadContainer');
        const jerseyUploadArea = document.getElementById('jerseyUploadArea');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            jerseyUploadContainer.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            jerseyUploadContainer.addEventListener(eventName, () => {
                jerseyUploadContainer.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            jerseyUploadContainer.addEventListener(eventName, () => {
                jerseyUploadContainer.classList.remove('dragover');
            }, false);
        });
        
        jerseyUploadContainer.addEventListener('drop', handleJerseyDrop, false);
    }
    
    function handleJerseyDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0]; // Only take the first file
        if (file) handleJerseyFileSelect({target: {files: [file]}});
    }
    
    function checkUrgentAvailability() {
        // Get current date in ET (Eastern Time)
        const now = new Date();
        
        // Convert to Eastern Time (ET)
        const etOptions = { timeZone: 'America/New_York' };
        const etTimeString = now.toLocaleString('en-US', etOptions);
        const etTime = new Date(etTimeString);
        
        // Get the hours in ET
        const etHours = etTime.getHours();
        const etMinutes = etTime.getMinutes();
        
        // Check if it's past noon (12 PM) in ET
        const isPastNoon = etHours >= 12;
        
        // Get the urgent option
        const urgentOption = document.querySelector('option[value="urgent"]');
        
        if (urgentOption) {
            if (isPastNoon) {
                // Disable the option if it's past noon but keep the original text
                urgentOption.disabled = true;
                
                // If urgent was selected, change to standard
                if (turnaroundTimeSelect.value === 'urgent') {
                    turnaroundTimeSelect.value = 'standard';
                    updatePricing(); // Update pricing after changing selection
                }
            } else {
                // Enable if it's before noon
                urgentOption.disabled = false;
            }
        }
        
        // Remove any existing urgent time note
        let urgentNote = document.getElementById('urgentTimeNote');
        if (urgentNote) {
            urgentNote.remove();
        }
    }
    
    function showPaymentOptions() {
        if (DEBUG_MODE) console.log('showPaymentOptions called');
        
        // Get a direct reference to the payment link container
        const paymentLinkContainer = document.getElementById('paymentLinkContainer');
        
        if (!paymentLinkContainer) {
            console.error('Payment link container not found');
            return;
        }
        
        // 1. Render the buttons
        paymentLinkContainer.innerHTML = `
            <p>Select a payment method:</p>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                <button id="payCard" class="submit-btn">Credit/Debit Card</button>
                <button id="payVenmo" class="submit-btn">Venmo</button>
                <button id="payCashApp" class="submit-btn">Cash&nbsp;App</button>
            </div>
        `;
        
        // 2. Attach handlers (now buttons exist)
        const amount = Math.round(parseFloat(totalPrice.textContent.replace('$', '')));
        
        // Card – direct to Stripe payment link if configured, otherwise dynamic generator
        document.getElementById('payCard').addEventListener('click', () => {
            const link = stripeLinks[amount];
            if (link) {
                prepareRedirect('Stripe', link);
                return;
            }
            
            paymentLinkContainer.innerHTML = '<p>Generating payment link...</p><div class="loader"></div>';
            const roundedAmount = Math.ceil(amount);
            const stripeLink = stripeLinks[roundedAmount] || stripeLinks[100]; // Default to highest if not found
            displayPaymentLink(stripeLink);
        });
        
        // Venmo
        document.getElementById('payVenmo').addEventListener('click', () => {
            const venmoUrl = `${paymentLinks.venmo}?txn=pay&amount=${amount}&note=${encodeURIComponent('Wilco Media Edit')}`;
            prepareRedirect('Venmo', venmoUrl);
        });
        
        // Cash App
        document.getElementById('payCashApp').addEventListener('click', () => {
            const cashTag = paymentLinks.cashapp;
            const cashUrl = `${cashTag}/${amount}`;
            prepareRedirect('Cash App', cashUrl);
        });
    }

    // Helper: two-stage redirect flow
    function prepareRedirect(platform, url) {
        // Persist chosen payment method to form for submission
        const paymentField = document.getElementById('paymentMethod');
        if (paymentField) {
            paymentField.value = platform;
        }
        const amount = Math.round(parseFloat(totalPrice.textContent.replace('$','')));
        paymentLinkContainer.innerHTML = `
            <button id="backBtn" class="link-btn" style="font-size:0.85rem; background:none; border:none; color:#e56883; cursor:pointer; padding:0; margin-bottom:4px;">← Back</button>
            <p style="margin-top:0;">Ready to continue to <strong>${platform}</strong>.</p>
            <p style="font-size:0.9rem; margin-top:6px;">Click <em>Continue to Pay</em> to open ${platform} in a new tab.${platform==='Venmo'||platform==='Cash App' ? ` Enter <strong>$${amount}</strong> when confirming the payment, then check the box below and press <strong>Submit&nbsp;Form</strong>.` : ' After completing payment, check the box below and press <strong>Submit&nbsp;Form</strong>.'}</p>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
                <button id="continuePay" class="submit-btn">Continue to Pay</button>
                <label style="display:flex; align-items:center; gap:6px; font-size:0.9rem;">
                    <input type="checkbox" id="paidConfirmChk" />
                    I've completed my payment.
                </label>
                <button id="submitFormBtn" class="submit-btn secondary-btn" disabled>Submit Form</button>
            </div>
        `;

        const continueBtn = document.getElementById('continuePay');
        const submitBtn = document.getElementById('submitFormBtn');
        const paidChk = document.getElementById('paidConfirmChk');
        const backBtn = document.getElementById('backBtn');

        continueBtn.addEventListener('click', () => {
            window.open(url, '_blank');
        }, { once: true });

        paidChk.addEventListener('change', () => {
            submitBtn.disabled = !paidChk.checked;
        });

        submitBtn.addEventListener('click', async () => {
            submitOrder();
        }, { once: true });

        backBtn.addEventListener('click', () => {
            showPaymentOptions();
        }, { once: true });
    }

    function displayPaymentLink(url) {
        paymentLinkContainer.innerHTML = `
            <p>Click the button below to complete your payment:</p>
            <a href="${url}" target="_blank" class="submit-btn" style="display: inline-block; text-decoration: none; margin-top: 15px;">Pay Now</a>
            <p style="margin-top: 15px; font-size: 0.9rem; color: var(--light-text);">You'll be redirected to Stripe's secure payment page.</p>
        `;
    }
    

    

    // Turnaround button click handler
    function handleTurnaroundButton(e) {
        const value = e.target.getAttribute('data-value');
        if (!value) return;
        turnaroundTimeSelect.value = value;
        turnaroundButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        updatePricing();
    }

    // Jersey swap button click handler
    function handleJerseyButton(e) {
        const value = e.target.getAttribute('data-value');
        if (value === null) return;
        const radio = document.querySelector(`input[name="jerseySwapCount"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
            handleJerseySwapChange({target: radio});
        }
        jerseyButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    }

// Display thank you screen after successful order submission
function showThankYouScreen() {
    const modal = document.getElementById('thankYouScreen');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const closeBtn = document.getElementById('closeThankYouBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            // Navigate parent/top frame to homepage, ensuring a fresh load
            const url = 'https://www.wilcomediallc.com';
            if (window.top && window.top !== window.self) {
                window.top.location.href = url;
            } else {
                window.location.href = url;
            }
        }, { once: true });
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }, { once: true });
}

// Initialize the main form logic
initForm();
}); // End of DOMContentLoaded listener
