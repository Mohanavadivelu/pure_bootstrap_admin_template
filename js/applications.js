/**
 * Applications Management Module
 * 
 * This module handles all functionality related to the applications management page,
 * including form submission, table operations, pagination, search, and API interactions.
 * 
 * Dependencies:
 * - Bootstrap 5 (for UI components and validation)
 * - api.js (for API communication functions)
 * 
 * @author Admin Panel System
 * @version 1.0.0
 */

// ===== GLOBAL VARIABLES =====
/**
 * Current page number for pagination
 * @type {number}
 */
let currentPage = 1;

/**
 * Number of items to display per page
 * @type {number}
 */
let itemsPerPage = 10;

/**
 * Total number of items available
 * @type {number}
 */
let totalItems = 0;

/**
 * Total number of pages available
 * @type {number}
 */
let totalPages = 0;

/**
 * Current search query string
 * @type {string}
 */
let currentSearch = '';

/**
 * ID of the currently selected table row
 * @type {number|null}
 */
let selectedRowId = null;

/**
 * Timeout reference for search debouncing
 * @type {number|null}
 */
let searchTimeout = null;

/**
 * ID of the application currently being edited
 * @type {number|null}
 */
let editingApplicationId = null;

// ===== INITIALIZATION FUNCTIONS =====

/**
 * Initializes the applications page when called from main.js
 * Sets up both form and table functionality
 */
function initializeApplicationsPage() {
    // Only initialize if elements exist (page is actually loaded)
    if (document.getElementById('applicationForm')) {
        console.log('Initializing applications page...');
        setupEventListeners();
        initializeForm();
        initializeTable();
        loadTableData();
    }
}

// Listen for navigation-triggered events
document.addEventListener('applicationsPageLoaded', function() {
    console.log('Applications page loaded via navigation');
    initializeApplicationsPage();
});

// Make initialization function globally available
window.initializeApplicationsPage = initializeApplicationsPage;

/**
 * Sets up event delegation for all application actions
 * Handles clicks on elements with data-action attributes
 */
function setupEventListeners() {
    // Remove any existing listeners to prevent duplicates
    document.removeEventListener('click', handleApplicationsClick);
    
    // Add event delegation for all data-action clicks
    document.addEventListener('click', handleApplicationsClick);
}

/**
 * Centralized event handler for all application actions
 * Routes actions based on data-action attribute values
 * 
 * @param {Event} e - The click event
 */
function handleApplicationsClick(e) {
    const action = e.target.getAttribute('data-action');
    if (!action) return;
    
    e.preventDefault();
    
    switch(action) {
        case 'refresh-table':
            refreshTable();
            break;
        case 'clear-search':
            clearSearch();
            break;
        case 'change-page':
            const page = parseInt(e.target.getAttribute('data-page'));
            changePage(page);
            break;
        case 'edit-app':
            const editId = parseInt(e.target.getAttribute('data-id'));
            editApplication(editId);
            break;
    }
}

/**
 * Initializes the application form with event listeners and validation
 * Sets up form submission handling, tracking options toggle, and validation
 */
function initializeForm() {
    // Get form element
    const form = document.getElementById('applicationForm');
    if (!form) return;

    // Set up tracking options toggle
    const enableTrackingCheckbox = document.getElementById('enableTracking');
    if (enableTrackingCheckbox) {
        enableTrackingCheckbox.addEventListener('change', function() {
            const trackingOptions = document.getElementById('trackingOptions');
            if (trackingOptions) {
                trackingOptions.style.display = this.checked ? 'block' : 'none';
            }
        });
    }

    // Set up form submission handler
    form.addEventListener('submit', handleFormSubmission);
}

/**
 * Initializes the applications table with search and pagination
 * Sets up event listeners for search input and items per page selection
 */
function initializeTable() {
    // Set up search input with debouncing
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = this.value.trim();
                currentPage = 1;
                loadTableData();
            }, 300); // 300ms debounce delay
        });
    }

    // Set up items per page selector
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function() {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            loadTableData();
        });
    }
}

// ===== FORM MANAGEMENT FUNCTIONS =====

/**
 * Handles form submission event
 * Validates form data and calls saveApplication if valid
 * 
 * @param {Event} event - The form submission event
 */
function handleFormSubmission(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target;
    
    if (form.checkValidity()) {
        const applicationData = extractFormData(form);
        saveApplication(applicationData);
    }
    
    form.classList.add('was-validated');
}

/**
 * Extracts and structures form data into application object
 * Converts form fields into the required JSON structure for API
 * 
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} Structured application data object
 */
function extractFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // Convert form data to object
    for (let [key, value] of formData.entries()) {
        const element = document.querySelector(`[name="${key}"]`);
        if (element.type === 'checkbox') {
            data[key] = element.checked;
        } else if (key === 'track_intr') {
            data[key] = parseInt(value);
        } else {
            data[key] = value;
        }
    }
    
    // Structure the data according to API requirements
    return {
        app_name: data.app_name,
        app_type: data.app_type,
        current_version: data.current_version,
        released_date: data.released_date,
        publisher: data.publisher,
        description: data.description || '',
        download_link: data.download_link || '',
        enable_tracking: data.enable_tracking || false,
        track: {
            usage: data.track_usage || false,
            location: data.track_location || false,
            cpu_memory: {
                track_cm: data.track_cm || false,
                track_intr: data.track_intr || 1
            }
        },
        registered_date: data.registered_date
    };
}


/**
 * Sets the form mode (create or edit) and updates UI accordingly
 * Changes button text and tracks editing state
 * 
 * @param {string} mode - Either 'create' or 'edit'
 * @param {number|null} appId - Application ID when in edit mode
 */
function setFormMode(mode, appId = null) {
    editingApplicationId = appId;
    const submitBtn = document.querySelector('button[type="submit"]');
    
    if (submitBtn) {
        if (mode === 'edit') {
            submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Update Application';
        } else {
            submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Save Application';
        }
    }
    
    console.log(`Form mode set to: ${mode}`, appId ? `(editing ID: ${appId})` : '');
}

/**
 * Resets form to create mode after successful save/update
 * Clears all form fields and resets validation state
 */
function resetFormToCreateMode() {
    const form = document.getElementById('applicationForm');
    if (!form) return;

    form.reset();
    
    // Hide tracking options
    const trackingOptions = document.getElementById('trackingOptions');
    if (trackingOptions) {
        trackingOptions.style.display = 'none';
    }
    
    // Remove validation classes
    form.classList.remove('was-validated');
    
    // Reset to create mode
    setFormMode('create');
}

/**
 * Populates form fields with application data
 * Used when editing an existing application
 * 
 * @param {Object} app - Application data object
 */
function populateFormWithData(app) {
    // Basic fields
    const fields = {
        'appName': app.app_name,
        'appType': app.app_type,
        'currentVersion': app.current_version,
        'releasedDate': app.released_date,
        'publisher': app.publisher,
        'description': app.description || '',
        'downloadLink': app.download_link || '',
        'registeredDate': app.registered_date
    };
    
    // Populate basic fields
    Object.keys(fields).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = fields[fieldId];
        }
    });
    
    // Handle tracking fields
    const enableTrackingCheckbox = document.getElementById('enableTracking');
    if (enableTrackingCheckbox) {
        enableTrackingCheckbox.checked = app.enable_tracking || false;
        enableTrackingCheckbox.dispatchEvent(new Event('change')); // Show/hide tracking options
    }
    
    if (app.track) {
        const trackUsage = document.getElementById('trackUsage');
        if (trackUsage) trackUsage.checked = app.track.usage || false;
        
        const trackLocation = document.getElementById('trackLocation');
        if (trackLocation) trackLocation.checked = app.track.location || false;
        
        if (app.track.cpu_memory) {
            const trackCpuMemory = document.getElementById('trackCpuMemory');
            if (trackCpuMemory) trackCpuMemory.checked = app.track.cpu_memory.track_cm || false;
            
            const trackInterval = document.getElementById('trackInterval');
            if (trackInterval) trackInterval.value = app.track.cpu_memory.track_intr || 1;
        }
    }
}

// ===== API INTEGRATION FUNCTIONS =====

/**
 * Saves application data to the server via API
 * Handles both create and update operations based on editing state
 * Shows loading state during save operation and handles success/error states
 * 
 * @param {Object} applicationData - The application data to save
 */
async function saveApplication(applicationData) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    try {
        // Show loading state
        const originalText = submitBtn.innerHTML;
        const isEditing = editingApplicationId !== null;
        
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span>${isEditing ? 'Updating...' : 'Saving...'}`;
        submitBtn.disabled = true;
        
        let result;
        if (isEditing) {
            // Update existing application
            const { updateApplication } = await import('./api.js');
            result = await updateApplication(editingApplicationId, applicationData);
            alert('Application updated successfully!');
        } else {
            // Create new application
            const { createApplication } = await import('./api.js');
            result = await createApplication(applicationData);
            alert('Application saved successfully!');
        }
        
        // Reset form and refresh UI
        resetFormToCreateMode();
        loadTableData(); // Refresh table to show updated data
        
        console.log(`Application ${isEditing ? 'updated' : 'saved'}:`, result);
        
    } catch (error) {
        console.error(`Error ${editingApplicationId ? 'updating' : 'saving'} application:`, error);
        alert(`Failed to ${editingApplicationId ? 'update' : 'save'} application. Please try again.`);
    } finally {
        // Restore button state
        const isEditing = editingApplicationId !== null;
        submitBtn.innerHTML = `<i class="bi bi-check-circle me-1"></i>${isEditing ? 'Update Application' : 'Save Application'}`;
        submitBtn.disabled = false;
    }
}

/**
 * Fetches applications from API - server only, no fallback data
 * Supports pagination, search filtering, and error handling
 * 
 * @param {number} page - Page number to fetch
 * @param {number} limit - Number of items per page
 * @param {string} search - Search query string
 * @returns {Promise<Object>} Promise resolving to paginated applications data
 */
async function fetchApplications(page, limit, search) {
    try {
        // Import API function and fetch applications
        const { getApplications } = await import('./api.js');
        const response = await getApplications(page, limit, search);
        return response;
    } catch (error) {
        console.error('API call failed:', error);
        
        // Show user-friendly error message instead of dummy data
        showError('Unable to connect to server. Please ensure the server is running on http://127.0.0.1:8000');
        
        // Return empty result instead of dummy data
        return {
            applications: [],
            total: 0,
            page: page,
            pages: 0
        };
    }
}

// ===== TABLE MANAGEMENT FUNCTIONS =====

/**
 * Loads table data from API with pagination and search support
 * Handles loading states, error handling, and empty states
 */
async function loadTableData() {
    showLoading(true);
    
    try {
        const data = await fetchApplications(currentPage, itemsPerPage, currentSearch);
        
        // Update pagination variables
        totalItems = data.total;
        totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Render table components
        renderTable(data.applications);
        renderPagination();
        updatePaginationInfo();
        
        // Show/hide empty state
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = data.applications.length === 0 ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Error loading table data:', error);
        showError('Failed to load applications. Please try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Renders table rows with application data
 * Creates clickable rows with action buttons for edit/delete operations
 * 
 * @param {Array} applications - Array of application objects to render
 */
function renderTable(applications) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    applications.forEach((app, index) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
        const row = document.createElement('tr');
        row.className = 'table-row';
        row.dataset.id = app.id;
        row.style.cursor = 'pointer';
        
        // Add click event for row selection
        row.addEventListener('click', function() {
            selectRow(this, app.id);
        });
        
        // Truncate publisher to 20 characters
        const truncatedPublisher = app.publisher.length > 20 
            ? app.publisher.substring(0, 20) + '...' 
            : app.publisher;
        
        // Truncate description for display (50 characters max)
        const truncatedDescription = app.description && app.description.length > 50
            ? app.description.substring(0, 50) + '...'
            : app.description;
        
        // Create row HTML with modifications
        row.innerHTML = `
            <td>${globalIndex}</td>
            <td>
                <div>
                    <strong>${app.app_name}</strong>
                    ${app.description ? `<br><small class="text-muted">${truncatedDescription}</small>` : ''}
                </div>
            </td>
            <td>${app.current_version}</td>
            <td title="${app.publisher}">${truncatedPublisher}</td>
            <td class="text-end">
                <button type="button" class="btn btn-outline-primary btn-sm" data-action="edit-app" data-id="${app.id}" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Handles row selection in the table
 * Highlights selected row and updates global selection state
 * 
 * @param {HTMLElement} row - The clicked table row element
 * @param {number} id - The application ID
 */
function selectRow(row, id) {
    // Remove previous selection highlighting
    document.querySelectorAll('.table-row').forEach(r => {
        r.classList.remove('table-active');
    });
    
    // Add selection highlighting to clicked row
    row.classList.add('table-active');
    selectedRowId = id;
    
    console.log('Selected application ID:', id);
}

/**
 * Renders pagination controls based on current page and total pages
 * Creates Previous/Next buttons and numbered page links
 */
function renderPagination() {
    const pagination = document.getElementById('paginationControls');
    if (!pagination) return;

    pagination.innerHTML = '';
    
    // Don't show pagination if only one page
    if (totalPages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" data-action="change-page" data-page="${currentPage - 1}">Previous</a>`;
    pagination.appendChild(prevLi);
    
    // Page number buttons (show current page and adjacent pages)
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-action="change-page" data-page="${i}">${i}</a>`;
        pagination.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" data-action="change-page" data-page="${currentPage + 1}">Next</a>`;
    pagination.appendChild(nextLi);
}

/**
 * Changes the current page and reloads table data
 * Validates page number before changing
 * 
 * @param {number} page - The page number to navigate to
 */
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    currentPage = page;
    loadTableData();
}

/**
 * Updates the pagination information text
 * Shows current range of displayed items and total count
 */
function updatePaginationInfo() {
    const paginationInfo = document.getElementById('paginationInfo');
    if (!paginationInfo) return;

    const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    paginationInfo.textContent = 
        `Showing ${start} to ${end} of ${totalItems} entries${currentSearch ? ` (filtered)` : ''}`;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Shows or hides the loading spinner
 * Toggles visibility of loading spinner and table content
 * 
 * @param {boolean} show - Whether to show the loading spinner
 */
function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const tableContainer = document.querySelector('.table-responsive');
    
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
    
    if (tableContainer) {
        tableContainer.style.display = show ? 'none' : 'block';
    }
}

/**
 * Displays an error message to the user
 * Currently uses alert, can be enhanced with better UI
 * 
 * @param {string} message - The error message to display
 */
function showError(message) {
    alert(message); // TODO: Replace with better error handling UI
}

/**
 * Clears the search input and reloads table data
 * Resets search state and returns to first page
 */
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    currentSearch = '';
    currentPage = 1;
    loadTableData();
}

/**
 * Refreshes the table data by reloading from API
 * Maintains current page and search state
 */
function refreshTable() {
    loadTableData();
}


// ===== ACTION FUNCTIONS =====

/**
 * Handles edit action for an application
 * Fetches application data from server and populates form for editing
 * 
 * @param {number} id - The application ID to edit
 */
async function editApplication(id) {
    try {
        console.log('Loading application for editing:', id);
        
        // Import API function and fetch application data
        const { getApplication } = await import('./api.js');
        const app = await getApplication(id);
        
        // Populate form with existing data
        populateFormWithData(app);
        
        // Set form to edit mode
        setFormMode('edit', id);
        
        console.log('Application loaded for editing:', app);
        
    } catch (error) {
        console.error('Error loading application for editing:', error);
        showError('Failed to load application data. Please try again.');
    }
}
