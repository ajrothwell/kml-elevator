let kmlContent = null;
let modifiedKML = null;
let fileName = '';

const kmlFileInput = document.getElementById('kmlFile');
const elevationInput = document.getElementById('elevationAdjustment');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const resultInfo = document.getElementById('resultInfo');

// Enable process button when file is selected
kmlFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
            kmlContent = event.target.result;
            processBtn.disabled = false;
            showStatus('File loaded successfully', 'success');
        };
        reader.onerror = () => {
            showStatus('Error reading file', 'error');
        };
        reader.readAsText(file);
    } else {
        processBtn.disabled = true;
        kmlContent = null;
    }
});

// Process KML file
processBtn.addEventListener('click', () => {
    if (!kmlContent) {
        showStatus('Please select a KML file first', 'error');
        return;
    }

    const adjustment = parseFloat(elevationInput.value);

    try {
        const result = processKML(kmlContent, adjustment);
        modifiedKML = result.kml;

        showStatus('Processing completed successfully!', 'success');
        resultInfo.textContent = `Processed ${result.lineStringCount} LineString(s). Elevations adjusted by ${adjustment} meters.`;
        resultsDiv.classList.remove('hidden');
    } catch (error) {
        showStatus(`Error processing KML: ${error.message}`, 'error');
        resultsDiv.classList.add('hidden');
    }
});

// Download modified KML
downloadBtn.addEventListener('click', () => {
    if (!modifiedKML) return;

    const blob = new Blob([modifiedKML], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.kml', '_elevated.kml');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus('File downloaded successfully!', 'success');
});

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

function processKML(kmlString, elevationAdjustment) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid KML file format');
    }

    // Find all LineString elements
    const lineStrings = xmlDoc.getElementsByTagName('LineString');
    let lineStringCount = 0;

    for (let i = 0; i < lineStrings.length; i++) {
        const lineString = lineStrings[i];
        lineStringCount++;

        // Process coordinates
        const coordinatesElement = lineString.getElementsByTagName('coordinates')[0];
        if (coordinatesElement) {
            const coords = coordinatesElement.textContent.trim();
            const adjustedCoords = adjustElevations(coords, elevationAdjustment);
            coordinatesElement.textContent = adjustedCoords;
        }

        // Set or update altitudeMode
        let altitudeMode = lineString.getElementsByTagName('altitudeMode')[0];
        if (altitudeMode) {
            altitudeMode.textContent = 'absolute';
        } else {
            // Create new altitudeMode element
            altitudeMode = xmlDoc.createElement('altitudeMode');
            altitudeMode.textContent = 'absolute';
            // Insert before coordinates element
            const coordsElement = lineString.getElementsByTagName('coordinates')[0];
            if (coordsElement) {
                lineString.insertBefore(altitudeMode, coordsElement);
            } else {
                lineString.appendChild(altitudeMode);
            }
        }
    }

    // Serialize back to string
    const serializer = new XMLSerializer();
    const modifiedKML = serializer.serializeToString(xmlDoc);

    return {
        kml: modifiedKML,
        lineStringCount: lineStringCount
    };
}

function adjustElevations(coordinatesString, adjustment) {
    // KML coordinates format: longitude,latitude,altitude
    // Multiple coordinates are separated by whitespace
    const coordPairs = coordinatesString.trim().split(/\s+/);

    const adjustedPairs = coordPairs.map(pair => {
        const parts = pair.split(',');
        if (parts.length >= 3) {
            // Has elevation (altitude)
            const lon = parts[0];
            const lat = parts[1];
            const alt = parseFloat(parts[2]) + adjustment;
            return `${lon},${lat},${alt}`;
        } else if (parts.length === 2) {
            // No elevation, add one
            const lon = parts[0];
            const lat = parts[1];
            return `${lon},${lat},${adjustment}`;
        }
        return pair;
    });

    return '\n' + adjustedPairs.join('\n') + '\n';
}
