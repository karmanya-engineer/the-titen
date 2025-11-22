// Owner Registration Logic
let registrationData = {
    step1: {},
    step2: {},
    step3: {}
};

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!Utils.checkAuth()) return;

    // Load theme
    Utils.loadTheme();

    let currentStep = 1;

    // Step 1: Owner Information
    const ownerForm = document.getElementById('ownerForm');
    document.getElementById('nextToStep2').addEventListener('click', () => {
        if (ownerForm.checkValidity()) {
            // Collect step 1 data
            registrationData.step1 = {
                name: document.getElementById('ownerName').value,
                email: document.getElementById('ownerEmail').value,
                phone: document.getElementById('ownerPhone').value,
                businessName: document.getElementById('businessName').value,
                businessAddress: document.getElementById('businessAddress').value
            };
            
            // Move to step 2
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'block';
            currentStep = 2;
        } else {
            ownerForm.reportValidity();
        }
    });

    // File upload handlers
    setupFileUpload('businessLicense', 'licenseFileName');
    setupFileUpload('proofOfOwnership', 'ownershipFileName');
    setupFileUpload('idDocument', 'idFileName');

    // Step 2: Documents
    document.getElementById('backToStep1').addEventListener('click', () => {
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step1').style.display = 'block';
        currentStep = 1;
    });

    document.getElementById('nextToStep3').addEventListener('click', () => {
        const documentForm = document.getElementById('documentForm');
        if (documentForm.checkValidity()) {
            // Collect step 2 data
            const licenseFile = document.getElementById('businessLicense').files[0];
            const ownershipFile = document.getElementById('proofOfOwnership').files[0];
            const idFile = document.getElementById('idDocument').files[0];

            registrationData.step2 = {
                businessLicense: licenseFile ? {
                    name: licenseFile.name,
                    size: licenseFile.size,
                    type: licenseFile.type
                } : null,
                proofOfOwnership: ownershipFile ? {
                    name: ownershipFile.name,
                    size: ownershipFile.size,
                    type: ownershipFile.type
                } : null,
                idDocument: idFile ? {
                    name: idFile.name,
                    size: idFile.size,
                    type: idFile.type
                } : null
            };

            // Move to step 3
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step3').style.display = 'block';
            currentStep = 3;
        } else {
            documentForm.reportValidity();
        }
    });

    // Step 3: Station Details
    document.getElementById('backToStep2').addEventListener('click', () => {
        document.getElementById('step3').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        currentStep = 2;
    });

    const stationForm = document.getElementById('stationForm');
    stationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect step 3 data
        registrationData.step3 = {
            stationName: document.getElementById('stationName').value,
            stationAddress: document.getElementById('stationAddress').value,
            chargerType: document.getElementById('chargerType').value,
            connectorType: document.getElementById('connectorType').value,
            powerKw: parseFloat(document.getElementById('powerKw').value),
            numChargers: parseInt(document.getElementById('numChargers').value),
            availability: document.getElementById('availability').value,
            costPerKwh: parseFloat(document.getElementById('costPerKwh').value),
            amenities: document.getElementById('amenities').value
        };

        const submitBtn = document.getElementById('submitRegistration');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Save registration to localStorage (pending admin approval)
            const registrations = getPendingRegistrations();
            const registration = {
                id: 'reg-' + Date.now(),
                ...registrationData.step1,
                ...registrationData.step3,
                documents: registrationData.step2,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                userId: authManager.getSession().userId
            };

            registrations.push(registration);
            localStorage.setItem('ev_route_pending_registrations', JSON.stringify(registrations));

            // Show success message
            document.getElementById('step3').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';

            Utils.showNotification('Registration submitted successfully!', 'success');

        } catch (error) {
            Utils.showNotification('Error submitting registration. Please try again.', 'error');
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
});

function setupFileUpload(inputId, fileNameId) {
    const input = document.getElementById(inputId);
    const fileName = document.getElementById(fileNameId);

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            fileName.style.display = 'block';
        } else {
            fileName.textContent = '';
            fileName.style.display = 'none';
        }
    });

    // Drag and drop
    const fileLabel = input.nextElementSibling;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileLabel.addEventListener(eventName, () => {
            fileLabel.style.borderColor = 'var(--primary-color)';
            fileLabel.style.background = 'rgba(0, 212, 170, 0.1)';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileLabel.addEventListener(eventName, () => {
            fileLabel.style.borderColor = 'var(--border-color)';
            fileLabel.style.background = 'var(--background)';
        }, false);
    });

    fileLabel.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        input.files = files;
        if (files[0]) {
            fileName.textContent = files[0].name;
            fileName.style.display = 'block';
        }
    }, false);
}

function getPendingRegistrations() {
    const registrations = localStorage.getItem('ev_route_pending_registrations');
    return registrations ? JSON.parse(registrations) : [];
}


