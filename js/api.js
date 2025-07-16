const API_BASE_URL = 'http://127.0.0.1:8000/api';

export function getChartData() {
    return fetch(`${API_BASE_URL}/chart-data`)
        .then(response => response.json());
}

// Application API functions
export function getApplications(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
    });
    
    if (search) {
        params.append('search', search);
    }
    
    return fetch(`${API_BASE_URL}/applications?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}

export function getApplication(id) {
    return fetch(`${API_BASE_URL}/applications/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}

export function createApplication(applicationData) {
    return fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

export function updateApplication(id, applicationData) {
    return fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

export function deleteApplication(id) {
    return fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}
