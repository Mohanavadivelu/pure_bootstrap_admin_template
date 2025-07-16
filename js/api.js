export function getChartData() {
    return fetch('http://127.0.0.1:8000/api/chart-data')
        .then(response => response.json());
}
