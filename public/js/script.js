document.addEventListener('DOMContentLoaded', () => {
    console.log('YuGen Fest 2026 Script Loaded');

    // --- 1. Navigation & Theme ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // Mobile Menu Toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Theme Switcher Logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');

        if (isLight) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(5, 5, 5, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        } else {
            navbar.style.background = 'rgba(5, 5, 5, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Global variable to store events
    let allEvents = [];

    // --- 2. Configuration & Event Data Loading ---
    let razorpayKey = '';

    fetchConfig();
    fetchEvents();

    async function fetchConfig() {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            razorpayKey = data.razorpayKey;
            console.log("Razorpay Key Loaded");
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    async function fetchEvents() {
        try {
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Failed to fetch events');
            allEvents = await response.json(); // Store globally
            renderEvents(allEvents);
            // populateEventSelect(allEvents); // Removed as dropdown is gone
        } catch (error) {
            console.error('Error loading events:', error);
            const day1Container = document.getElementById('day1');
            if (day1Container) day1Container.innerHTML = `<p style="color: red; text-align: center; padding: 2rem;">Error: ${error.message}. Please check console.</p>`;
        }
    }

    function renderEvents(events) {
        const categories = ['Technical', 'Non-Technical', 'Sports'];
        const days = ['Day 1', 'Day 2'];
        const containerMap = {
            'Day 1': document.getElementById('day1'),
            'Day 2': document.getElementById('day2')
        };

        // Clear existing content
        Object.values(containerMap).forEach(el => { if (el) el.innerHTML = ''; });

        days.forEach(day => {
            const dayEvents = events.filter(e => e.day === day);
            const container = containerMap[day];
            if (!container) return; // Should not happen

            categories.forEach(cat => {
                const catEvents = dayEvents.filter(e => (e.category || '').toLowerCase() === cat.toLowerCase());

                if (catEvents.length > 0) {
                    // Create Header
                    const header = document.createElement('h4');
                    header.className = 'sub-section-title';
                    header.style.cssText = "color: var(--color-primary); font-size: 1.5rem; margin: 2rem 0 1rem; border-left: 4px solid var(--color-accent); padding-left: 10px;";
                    header.textContent = `${cat} Events`;
                    container.appendChild(header);

                    // Create Grid
                    const grid = document.createElement('div');
                    grid.className = 'events-grid';
                    // Add specific ID for error handling if needed, though mostly unused now
                    grid.id = `${day.replace(' ', '').toLowerCase()}-${cat.toLowerCase()}`;

                    catEvents.forEach(event => {
                        const card = createEventCard(event);
                        grid.appendChild(card);
                    });

                    container.appendChild(grid);
                }
            });

            // If no events at all for the day
            if (dayEvents.length === 0) {
                container.innerHTML = '<p style="text-align:center; color: var(--color-text-muted); padding: 2rem;">No events scheduled for this day yet.</p>';
            }
        });
    }

    function createEventCard(event) {
        const div = document.createElement('div');
        div.className = 'event-card';
        div.innerHTML = `
            <div class="event-image">
                <div class="event-icon-container">
                    <i class="${event.icon || 'fas fa-star'}"></i>
                </div>
            </div>
            <div class="event-details">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-desc">${event.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span style="font-size: 0.85rem; color: var(--color-primary);">${event.type}</span>
                    <span style="font-weight: bold;">₹${event.fee}</span>
                </div>
                <button class="btn-register" onclick="openModal('${event.id}')">
                    Register Now <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        return div;
    }

    // --- 3. Tab Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to current
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- 4. Modal Logic ---
    const modal = document.getElementById('registration-modal');
    const closeModal = document.querySelector('.close-modal');
    const registrationForm = document.getElementById('registration-form');
    const teamContainer = document.getElementById('team-members-container');
    // const eventSelect = document.getElementById('reg-event'); // Removed
    const passTypeSelect = document.getElementById('reg-pass-type');
    const feeDisplay = document.getElementById('reg-fee-display');

    // --- View Elements ---
    const viewDetails = document.getElementById('modal-view-details');
    const viewForm = document.getElementById('modal-view-form');
    const btnShowForm = document.getElementById('btn-show-form');
    const btnBackDetails = document.getElementById('btn-back-details');

    // --- Multi-Event Helpers (Scoped inside DOMContentLoaded, attached to window) ---
    let currentEventContext = null;

    window.handlePassTypeChange = () => {
        setupEventSelection(currentEventContext);
    }

    function setupEventSelection(primaryEvent) {
        if (!primaryEvent) return;

        const eventContainer = document.getElementById('event-selection-container');
        const list = document.getElementById('events-checkbox-list');
        const passSelect = document.getElementById('reg-pass-type');
        const selectedPass = passSelect ? passSelect.value : "";

        // STRICT Filtering Logic based on Dropdown Value
        let filterMode = 'CONTEXT';

        // Exact matches from HTML options
        if (selectedPass === 'Day 2 Pass (₹250)') {
            filterMode = 'Day 2';
        } else if (selectedPass === 'Day 1 Pass (₹250)') {
            filterMode = 'Day 1';
        } else if (selectedPass === '2 Days Pass (₹400)') {
            filterMode = 'ALL';
        } else {
            // Fallback context if dropdown is somehow empty (initial load)
            const cat = (primaryEvent.category || '').toLowerCase();
            filterMode = (cat === 'technical') ? 'Day 1' : 'Day 2';
        }

        // Filter Events
        const filteredEvents = allEvents.filter(e => {
            const eDay = (e.day || '').toLowerCase();
            const eCat = (e.category || '').toLowerCase();

            if (filterMode === 'ALL') return true;

            const target = filterMode.toLowerCase();

            // Primary Check: Database 'day' column
            if (eDay === target) return true;

            // Fallback Check: Category (Only if day is missing/mismatched)
            // Critical Fix: Ensure Day 2 ONLY gets non-technical/sports
            if (target === 'day 2') {
                // If DB says "Day 2", it's already caught.
                // If DB is missing "day", fallback:
                if (!e.day) return eCat !== 'technical';
                return false; // If DB says "Day 1", deny it.
            }
            if (target === 'day 1') {
                if (!e.day) return eCat === 'technical';
                return false;
            }
            return false;
        });

        list.innerHTML = '';
        if (filteredEvents.length === 0) {
            list.innerHTML = `<p style="color: #ccc; font-size: 0.9em;">No events found for ${filterMode}.</p>`;
        }

        // Sort by Day then Title
        filteredEvents.sort((a, b) => {
            if (filterMode === 'ALL') {
                const dayA = (a.day || '').toLowerCase();
                const dayB = (b.day || '').toLowerCase();
                if (dayA < dayB) return -1;
                if (dayA > dayB) return 1;
            }
            return a.title.localeCompare(b.title);
        });

        filteredEvents.forEach(e => {
            const div = document.createElement('div');
            // Styles
            div.style.marginBottom = '12px';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'flex-start';
            div.style.padding = '5px';
            div.style.background = 'rgba(255, 255, 255, 0.05)';
            div.style.borderRadius = '5px';

            // Add Day Label if ALL
            if (filterMode === 'ALL') {
                div.style.borderLeft = (e.day === 'Day 1') ? '3px solid #00f3ff' : '3px solid #ff00ff';
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = e.title;
            checkbox.id = `evt-${e.id}`;
            checkbox.name = 'selected_events';
            // Styles
            checkbox.style.marginRight = '12px';
            checkbox.style.width = '18px';
            checkbox.style.height = '18px';
            checkbox.style.accentColor = '#00f3ff';
            checkbox.style.cursor = 'pointer';

            // Auto-select primary
            if (e.id === primaryEvent.id) {
                checkbox.checked = true;
            }

            checkbox.onchange = () => {
                const checked = list.querySelectorAll('input[type="checkbox"]:checked');
                // Strict Limit: 4 Events for Day 1 / Day 2 Passes
                // Unlimited for 2 Days Pass (ALL)
                if (filterMode !== 'ALL' && checked.length > 4) {
                    checkbox.checked = false;
                    alert("You can select a maximum of 4 events for a Single Day Pass.");
                }
            };

            const label = document.createElement('label');
            label.htmlFor = `evt-${e.id}`;
            // Show Day label in text if showing ALL
            label.textContent = (filterMode === 'ALL') ? `[${e.day}] ${e.title}` : e.title;
            label.style.color = '#fff';
            label.style.cursor = 'pointer';
            label.style.fontSize = '14px';
            label.style.userSelect = 'none';
            label.style.flex = '1';

            div.appendChild(checkbox);
            div.appendChild(label);
            list.appendChild(div);
        });

        eventContainer.style.display = 'block';
    }

    // Global function to open modal (Redesigned)
    window.openModal = (eventId) => {
        const event = allEvents.find(e => e.id == eventId);
        if (!event) return;

        modal.style.display = 'flex';

        // Reset Views: Show Details, Hide Form
        viewDetails.style.display = 'block';
        viewForm.style.display = 'none';

        // 1. Populate Event Details View
        // document.getElementById('modal-event-title').textContent = event.title; // Removed to keep "Event Rules" static header
        // document.getElementById('modal-event-desc').textContent = event.description; // Not in sketch main view

        // Populate Rules Box
        const rulesList = document.getElementById('modal-rules-list');
        rulesList.innerHTML = '';
        let rules = [];
        try {
            rules = typeof event.rule_book === 'string' ? JSON.parse(event.rule_book) : event.rule_book;
        } catch (e) { rules = ['Rules not available.']; }

        if (rules && Array.isArray(rules)) {
            rules.forEach(rule => {
                const li = document.createElement('li');
                li.textContent = rule;
                rulesList.appendChild(li);
            });
        }

        // Populate Coordinators Row
        const coordsRow = document.getElementById('modal-coordinators');
        coordsRow.innerHTML = '';
        let coords = [];
        try {
            coords = typeof event.coordinators === 'string' ? JSON.parse(event.coordinators) : event.coordinators;
        } catch (e) { coords = []; }

        if (coords && Array.isArray(coords)) {
            coords.forEach(c => {
                const card = document.createElement('div');
                card.className = 'coordinator-card-sketch';
                card.innerHTML = `
                    <div class="photo-box">
                        <img src="${c.image || 'https://via.placeholder.com/100x80'}" alt="${c.name}">
                    </div>
                    <div class="coord-details">
                        <h4>${c.name}</h4>
                        <p>${c.phone}</p>
                    </div>
                `;
                coordsRow.appendChild(card);
            });
        }

        // 2. Prepare Form Data (Hidden)
        document.getElementById('reg-event-id').value = event.id;

        // Logic for team members
        const teamContainer = document.getElementById('team-members-container');
        if (event.type === 'TEAM' || event.type === 'BOTH') {
            teamContainer.style.display = 'block';
        } else {
            teamContainer.style.display = 'none';
        }

        // --- Multi-Event Selection Reset ---
        currentEventContext = event; // Updates the closure variable
        const passSelect = document.getElementById('reg-pass-type');
        passSelect.value = "";
        document.getElementById('event-selection-container').style.display = 'none';

        // --- Auto-Select Pass Logic ---
        // Automatically select the correct Day pass based on the event, but allow user to change it.
        const pCat = (event.category || '').toLowerCase();
        const targetPass = (pCat === 'technical') ? 'Day 1 Pass (₹250)' : 'Day 2 Pass (₹250)';

        passSelect.value = targetPass; // Auto-select

        // Trigger the change handler to show events immediately
        handlePassTypeChange();
        // -----------------------------------


        // Set Pass Type Logic
        // Set Pass Type Logic (Already handled by setupEventSelection, but ensuring fallback)
        if (!passTypeSelect.value) {
            if (event.day === 'Day 1') {
                passTypeSelect.value = 'Day 1 Pass (₹250)';
            } else if (event.day === 'Day 2') {
                passTypeSelect.value = 'Day 2 Pass (₹250)';
            }
        }
        passTypeSelect.dispatchEvent(new Event('change'));
    };

    // View Switching Logic
    btnShowForm.addEventListener('click', () => {
        viewDetails.style.display = 'none';
        viewForm.style.display = 'block';
    });

    btnBackDetails.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission if inside form
        viewForm.style.display = 'none';
        viewDetails.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        resetForm();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            resetForm();
        }
    });

    function resetForm() {
        registrationForm.reset();
        teamContainer.style.display = 'none';
        document.getElementById('team-inputs').innerHTML = '';
        document.getElementById('payment-status').style.display = 'none';
        document.getElementById('success-message').style.display = 'none';
        registrationForm.style.display = 'block';
        passTypeSelect.value = ''; // Reset to default (empty)
        updateFee();
    }

    // Pass Type Change Listener
    passTypeSelect.addEventListener('change', updateFee);

    function updateFee() {
        const type = passTypeSelect.value;
        if (type.includes('250')) {
            feeDisplay.textContent = '₹250';
        } else if (type.includes('400')) {
            feeDisplay.textContent = '₹400';
        } else {
            feeDisplay.textContent = '₹0';
        }
    }

    // Populate Select Dropdown - REMOVED
    /*
    function populateEventSelect(events) {
        ...
    }
    eventSelect.addEventListener('change', ...);
    */

    // Add Team Member Input
    document.getElementById('add-member-btn').addEventListener('click', () => {
        const teamInputs = document.getElementById('team-inputs');
        const count = teamInputs.children.length + 1;

        if (count > 4) {
            alert("Max 5 team members allowed.");
            return;
        }

        const div = document.createElement('div');
        div.innerHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                <input type="text" name="team_member[]" placeholder="Member ${count + 1} Name" required>
                <button type="button" onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color: var(--color-accent); cursor: pointer;">&times;</button>
            </div>
        `;
        teamInputs.appendChild(div);
    });

    // Form Submission
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = registrationForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Processing...';
        btn.disabled = true;

        // Simulate Payment Processing
        registrationForm.style.display = 'none';
        document.getElementById('payment-status').style.display = 'block';

        const passType = passTypeSelect.value;
        const amount = passType.includes('400') ? 400 : 250;

        // Find Event Title (or Multiple)
        const eventId = document.getElementById('reg-event-id').value;

        // Collect Multi-Events
        const checkedBoxes = document.querySelectorAll('input[name="selected_events"]:checked');
        let finalEventString = "";

        if (checkedBoxes.length > 0) {
            finalEventString = Array.from(checkedBoxes).map(cb => cb.value).join(', ');
        } else {
            // Fallback
            const selectedEvent = allEvents.find(e => e.id == eventId);
            finalEventString = selectedEvent ? selectedEvent.title : 'Unknown Event';
        }

        const formData = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            // New Fields
            department: document.getElementById('reg-dept').value,
            year: document.getElementById('reg-year').value,
            rollNo: document.getElementById('reg-roll').value,
            college: document.getElementById('reg-college').value,
            phone: document.getElementById('reg-phone').value,

            event: finalEventString, // Send Comma-Separated Titles
            eventId: eventId,
            teamMembers: [],
            passType: passType,
            amount: amount
        };

        // Collect team members if visible
        if (teamContainer.style.display !== 'none') {
            document.querySelectorAll('input[name="team_member[]"]').forEach(input => {
                if (input.value.trim()) formData.teamMembers.push(input.value.trim());
            });
        }

        try {
            // Simulate network delay for payment
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // 2. Create Razorpay Order
                const createOrderRes = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: amount, // Amount in Rupees
                        receipt: 'rcpt_' + result.registrationId
                    })
                });

                const orderData = await createOrderRes.json();

                if (orderData.id) {
                    // Open Razorpay Checkout
                    const options = {
                        "key": razorpayKey,
                        "amount": orderData.amount,
                        "currency": orderData.currency,
                        "name": "YuGen Fest 2026",
                        "description": "Event Registration Fee",
                        "image": "https://example.com/your_logo", // You can replace this
                        "order_id": orderData.id,
                        "handler": async function (response) {
                            // 3. Verify Payment
                            document.getElementById('payment-status').querySelector('p').textContent = 'Verifying Payment...';

                            const verifyRes = await fetch('/api/verify-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    registrationId: result.registrationId
                                })
                            });

                            const verifyData = await verifyRes.json();

                            if (verifyData.success) {
                                document.getElementById('payment-status').style.display = 'none';
                                document.getElementById('success-message').style.display = 'block';
                            } else {
                                alert("Payment Verification Failed: " + verifyData.error);
                                document.getElementById('payment-status').style.display = 'none';
                                registrationForm.style.display = 'block';
                            }
                        },
                        "prefill": {
                            "name": document.getElementById('reg-name').value,
                            "email": document.getElementById('reg-email').value,
                            "contact": document.getElementById('reg-phone').value // could collect phone number
                        },
                        "theme": {
                            "color": "#00f3ff"
                        },
                        "modal": {
                            "ondismiss": function () {
                                alert('Payment Cancelled');
                                document.getElementById('payment-status').style.display = 'none';
                                registrationForm.style.display = 'block';
                                btn.innerHTML = originalText;
                                btn.disabled = false;
                            }
                        }
                    };

                    const rzp1 = new Razorpay(options);
                    rzp1.open();

                } else {
                    throw new Error('Could not generate order ID');
                }

            } else {
                throw new Error(result.error || 'Registration failed');
            }

        } catch (error) {
            alert(error.message);
            document.getElementById('payment-status').style.display = 'none';
            registrationForm.style.display = 'block';
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // --- 5. Scroll Animations (Simple IntersectionObserver) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-title, .section-text, .event-card, .gallery-item').forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });


    // --- 6. About Section Image Slider ---
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length > 0) {
        setInterval(() => {
            // Remove active class from current
            slides[currentSlide].classList.remove('active');

            // Move to next slide
            currentSlide = (currentSlide + 1) % slides.length;

            // Add active class to next
            slides[currentSlide].classList.add('active');
        }, 4000); // Change every 4 seconds
    }

});

// --- Multi-Event Logic (Global Scope for HTML Access) ---
let currentEventContext = null;

function handlePassTypeChange() {
    setupEventSelection(currentEventContext);
}

function setupEventSelection(primaryEvent) {
    if (!primaryEvent) return;

    const eventContainer = document.getElementById('event-selection-container');
    const list = document.getElementById('events-checkbox-list');
    const passTypeSelect = document.getElementById('reg-pass-type');

    // 1. Determine Target Day based on Dropdown, fallback to Primary Event Day
    let selectedPass = passTypeSelect.value;
    let targetDay = '';

    if (selectedPass.includes('Day 1')) {
        targetDay = 'Day 1';
    } else if (selectedPass.includes('Day 2')) {
        targetDay = 'Day 2';
    } else if (selectedPass.includes('2 Days')) {
        targetDay = 'ALL';
    } else {
        // Initial Load (Dropdown empty/default): Use Primary Event's Day
        // Use DB 'day' column if available, else fallback slightly better logic
        if (primaryEvent.day) {
            targetDay = primaryEvent.day;
            // Auto-set dropdown
            if (targetDay === 'Day 1') passTypeSelect.value = "Day 1 Pass (₹250)";
            else if (targetDay === 'Day 2') passTypeSelect.value = "Day 2 Pass (₹250)";
        } else {
            // Extreme fallback if DB mismatch
            targetDay = primaryEvent.category === 'technical' ? 'Day 1' : 'Day 2';
        }
    }

    // 2. Filter Events
    const filteredEvents = allEvents.filter(e => {
        if (targetDay === 'ALL') return true;
        // Strict check against DB 'day' column
        if (e.day) return e.day === targetDay;
        // Fallback (only if day missing)
        return false;
    });

    // 3. Render Checkboxes
    list.innerHTML = '';
    filteredEvents.forEach(e => {
        const div = document.createElement('div');
        div.style.marginBottom = '8px';
        div.style.display = 'flex';
        div.style.alignItems = 'center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = e.title;
        checkbox.id = `evt-${e.id}`;
        checkbox.name = 'selected_events';
        checkbox.style.marginRight = '10px';
        checkbox.style.accentColor = '#00f3ff';

        // Auto-select primary event
        if (e.id === primaryEvent.id) {
            checkbox.checked = true;
            // Optional: Disable unchecking primary? 
            // checkbox.disabled = true; 
        }

        checkbox.onchange = () => {
            const checked = list.querySelectorAll('input[type="checkbox"]:checked');
            // Max 4 events per day (Logic: 2 Days might allow more? keeping 4 for now)
            if (checked.length > 4) {
                checkbox.checked = false;
                alert("You can select a maximum of 4 events.");
            }
        };

        const label = document.createElement('label');
        label.htmlFor = `evt-${e.id}`;
        label.textContent = e.title;
        label.style.color = '#fff';
        label.style.fontSize = '0.9em';
        label.style.cursor = 'pointer';

        div.appendChild(checkbox);
        div.appendChild(label);
        list.appendChild(div);
    });

    eventContainer.style.display = 'block';
}
