document.addEventListener('DOMContentLoaded', () => {
    // Input Fields
    const fields = {
        eventName: document.getElementById('eventName'),
        organizer: document.getElementById('organizer'),
        volunteersCount: document.getElementById('volunteersCount'),
        jobDescription: document.getElementById('jobDescription'),
        location: document.getElementById('location'),
        eventDate: document.getElementById('eventDate'),
        eventDateFrom: document.getElementById('eventDateFrom'),
        eventDateTo: document.getElementById('eventDateTo'),
        eventTime: document.getElementById('eventTime'),
        additionalInfo: document.getElementById('additionalInfo'),
        whatsappNumber: document.getElementById('whatsappNumber'),
        payAmount: document.getElementById('payAmount'),
        payAdditional: document.getElementById('payAdditional')
    };

    // Toggle Switches
    const toggles = {
        eventName: document.getElementById('toggle-eventName'),
        organizer: document.getElementById('toggle-organizer'),
        volunteersCount: document.getElementById('toggle-volunteersCount'),
        jobDescription: document.getElementById('toggle-jobDescription'),
        genderRequirement: document.getElementById('toggle-genderRequirement'),
        payDetails: document.getElementById('toggle-payDetails'),
        location: document.getElementById('toggle-location'),
        eventDate: document.getElementById('toggle-eventDate'),
        eventTime: document.getElementById('toggle-eventTime'),
        additionalInfo: document.getElementById('toggle-additionalInfo'),
        whatsappNumber: document.getElementById('toggle-whatsappNumber')
    };

    // Form groups (for visual disabling)
    const groups = {
        eventName: document.getElementById('group-eventName'),
        organizer: document.getElementById('group-organizer'),
        volunteersCount: document.getElementById('group-volunteersCount'),
        jobDescription: document.getElementById('group-jobDescription'),
        genderRequirement: document.getElementById('group-genderRequirement'),
        payDetails: document.getElementById('group-payDetails'),
        location: document.getElementById('group-location'),
        eventDate: document.getElementById('group-eventDate'),
        eventTime: document.getElementById('group-eventTime'),
        additionalInfo: document.getElementById('group-additionalInfo'),
        whatsappNumber: document.getElementById('group-whatsappNumber')
    };

    // Error messages elements
    const errors = {
        eventName: document.getElementById('error-eventName'),
        whatsappNumber: document.getElementById('error-whatsappNumber')
    };

    // Output containers
    const previewText = document.getElementById('preview-text');
    const waBubbleText = document.getElementById('wa-bubble-text');
    const waTimestamp = document.getElementById('wa-timestamp');
    const whatsappLinkText = document.getElementById('whatsapp-link-text');

    // Buttons
    const btnCopyMsg = document.getElementById('btn-copy-msg');
    const btnCopyLink = document.getElementById('btn-copy-link');
    const btnOpenWa = document.getElementById('btn-open-wa');

    // Toast
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // State Variables
    let generatedMessage = "";
    let generatedLink = "";
    let isFormValid = true;

    // Set default date to today to make the UX nicer
    const today = new Date().toISOString().split('T')[0];
    fields.eventDate.value = today;

    // Set default time to current time
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    fields.eventTime.value = `${currentHours}:${currentMinutes}`;

    // Helper: Show custom toast message
    function showToast(message, isSuccess = true) {
        toastMessage.textContent = message;
        // Update toast icon if needed
        const icon = toast.querySelector('.toast-icon');
        if (isSuccess) {
            icon.setAttribute('data-lucide', 'check-circle');
            toast.style.borderColor = 'var(--primary)';
        } else {
            icon.setAttribute('data-lucide', 'alert-triangle');
            toast.style.borderColor = 'var(--danger)';
        }
        lucide.createIcons();
        
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Helper: Formats 24h time to 12h AM/PM
    function formatTime12h(timeStr) {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHours = h % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
    }

    // Helper: Formats Date to human-friendly format
    function formatDateFriendly(dateStr) {
        if (!dateStr) return "";
        const dateObj = new Date(dateStr + 'T00:00:00'); // Prevent timezone offset issues
        if (isNaN(dateObj)) return dateStr;
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Helper: Formats Date Range to natural language
    function formatDateRange(fromStr, toStr) {
        if (!fromStr && !toStr) return "";
        if (fromStr && !toStr) return `starting from *${formatDateFriendly(fromStr)}*`;
        if (!fromStr && toStr) return `until *${formatDateFriendly(toStr)}*`;

        const fromDate = new Date(fromStr + 'T00:00:00');
        const toDate = new Date(toStr + 'T00:00:00');

        if (isNaN(fromDate) || isNaN(toDate)) {
            return `from *${fromStr}* to *${toStr}*`;
        }

        if (fromStr === toStr) {
            return `on *${formatDateFriendly(fromStr)}*`;
        }

        const fromYear = fromDate.getFullYear();
        const toYear = toDate.getFullYear();
        const fromMonth = fromDate.getMonth();
        const toMonth = toDate.getMonth();
        const fromDay = fromDate.getDate();
        const toDay = toDate.getDate();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        if (fromMonth === toMonth && fromYear === toYear) {
            return `from *${monthNames[fromMonth]} ${fromDay} to ${toDay}, ${fromYear}*`;
        }

        if (fromYear === toYear) {
            return `from *${monthNames[fromMonth]} ${fromDay}* to *${monthNames[toMonth]} ${toDay}, ${fromYear}*`;
        }

        return `from *${monthNames[fromMonth]} ${fromDay}, ${fromYear}* to *${monthNames[toMonth]} ${toDay}, ${toYear}*`;
    }

    // Helper: Formats Multiple Dates to natural list
    function formatMultipleDates(dateStrings) {
        const validDates = dateStrings
            .filter(d => d.trim() !== "")
            .map(d => new Date(d + 'T00:00:00'))
            .filter(d => !isNaN(d));

        if (validDates.length === 0) return "";
        
        if (validDates.length === 1) {
            return `on *${formatDateFriendly(dateStrings[0])}*`;
        }

        validDates.sort((a, b) => a - b);

        const years = validDates.map(d => d.getFullYear());
        const allSameYear = years.every(y => y === years[0]);
        const targetYear = years[0];

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const formattedParts = validDates.map(d => {
            if (allSameYear) {
                return `${monthNames[d.getMonth()]} ${d.getDate()}`;
            } else {
                return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
            }
        });

        let listStr = "";
        if (formattedParts.length === 2) {
            listStr = `${formattedParts[0]} and ${formattedParts[1]}`;
        } else {
            listStr = formattedParts.slice(0, -1).join(', ') + `, and ${formattedParts[formattedParts.length - 1]}`;
        }

        if (allSameYear) {
            listStr += `, ${targetYear}`;
        }

        return `on the following dates: *${listStr}*`;
    }

    // Helper: Clean & validate phone number
    function cleanPhoneNumber(phone) {
        return phone.replace(/[^\d]/g, ''); // Keep only digits
    }

    function validatePhone(phone) {
        if (!phone) return false;
        const cleaned = cleanPhoneNumber(phone);
        // Valid WhatsApp phone numbers must contain country code and be 10-15 digits
        return cleaned.length >= 10 && cleaned.length <= 15;
    }

    // Handle Toggles and disable inputs dynamically
    function handleToggleState(fieldName) {
        const toggle = toggles[fieldName];
        const group = groups[fieldName];

        if (toggle.checked) {
            group.classList.remove('field-disabled');
            group.querySelectorAll('input, textarea, button, select').forEach(el => {
                if (el !== toggle) {
                    el.removeAttribute('disabled');
                }
            });
        } else {
            group.classList.add('field-disabled');
            group.querySelectorAll('input, textarea, button, select').forEach(el => {
                if (el !== toggle) {
                    el.setAttribute('disabled', 'true');
                }
            });
            // Remove validation errors if disabled
            group.classList.remove('has-error');
        }
        generateAnnouncement();
    }

    // Connect all toggle switches to listeners
    Object.keys(toggles).forEach(key => {
        toggles[key].addEventListener('change', () => handleToggleState(key));
    });

    // Date System Selectors & State
    const datePanelSingle = document.getElementById('date-panel-single');
    const datePanelRange = document.getElementById('date-panel-range');
    const datePanelMultiple = document.getElementById('date-panel-multiple');
    const multipleDatesList = document.getElementById('multiple-dates-list');
    const btnAddDate = document.getElementById('btn-add-date');

    // Switch date subpanels visibility based on selected radio
    function updateDatePanelsVisibility() {
        const activeDateType = document.querySelector('input[name="dateType"]:checked')?.value || 'single';
        
        datePanelSingle.classList.add('d-none');
        datePanelRange.classList.add('d-none');
        datePanelMultiple.classList.add('d-none');

        if (activeDateType === 'single') {
            datePanelSingle.classList.remove('d-none');
        } else if (activeDateType === 'range') {
            datePanelRange.classList.remove('d-none');
        } else if (activeDateType === 'multiple') {
            datePanelMultiple.classList.remove('d-none');
        }
        generateAnnouncement();
    }

    // Connect date type radios to view switcher
    document.querySelectorAll('input[name="dateType"]').forEach(radio => {
        radio.addEventListener('change', updateDatePanelsVisibility);
    });

    // Handle dynamic multiple date rows
    function addMultipleDateRow(value = "") {
        const row = document.createElement('div');
        row.className = 'multiple-date-row';

        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';

        const icon = document.createElement('i');
        icon.className = 'input-icon';
        icon.setAttribute('data-lucide', 'calendar');

        const input = document.createElement('input');
        input.type = 'date';
        input.className = 'multiple-date-input';
        input.value = value || new Date().toISOString().split('T')[0];

        // Disable if main date toggle is off
        if (!toggles.eventDate.checked) {
            input.setAttribute('disabled', 'true');
        }

        wrapper.appendChild(icon);
        wrapper.appendChild(input);
        row.appendChild(wrapper);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn-delete-date';
        delBtn.title = 'Remove Date';
        if (!toggles.eventDate.checked) {
            delBtn.setAttribute('disabled', 'true');
        }

        const delIcon = document.createElement('i');
        delIcon.setAttribute('data-lucide', 'trash-2');
        delBtn.appendChild(delIcon);
        row.appendChild(delBtn);

        multipleDatesList.appendChild(row);

        // Render Lucide icons for new elements
        lucide.createIcons();

        // Listeners for dynamic inputs
        input.addEventListener('input', generateAnnouncement);
        input.addEventListener('change', generateAnnouncement);

        delBtn.addEventListener('click', () => {
            row.remove();
            generateAnnouncement();
        });

        generateAnnouncement();
    }

    // Add row click listener
    btnAddDate.addEventListener('click', () => {
        addMultipleDateRow();
    });

    // Initialize list with one row on load
    addMultipleDateRow(today);

    // Set default range dates
    fields.eventDateFrom.value = today;
    fields.eventDateTo.value = today;

    // Run visibility toggle initially
    updateDatePanelsVisibility();

    // Connect all inputs to live update listeners
    Object.keys(fields).forEach(key => {
        if (fields[key]) {
            fields[key].addEventListener('input', generateAnnouncement);
            fields[key].addEventListener('change', generateAnnouncement);
        }
    });

    // Connect radio buttons to live update listeners
    document.querySelectorAll('input[name="genderRequirement"]').forEach(radio => {
        radio.addEventListener('change', generateAnnouncement);
    });

    // Set Live Mock Timestamp
    function updateMockTimestamp() {
        const date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        minutes = String(minutes).padStart(2, '0');
        waTimestamp.textContent = `${hours}:${minutes} ${ampm}`;
    }

    // Main logic: Assemble announcement message and link
    function generateAnnouncement() {
        isFormValid = true;

        // 1. Check validations
        // Event Name Required Validation
        if (toggles.eventName.checked && !fields.eventName.value.trim()) {
            groups.eventName.classList.add('has-error');
            isFormValid = false;
        } else {
            groups.eventName.classList.remove('has-error');
        }

        // WhatsApp Number Required & Format Validation
        const phoneVal = fields.whatsappNumber.value.trim();
        if (toggles.whatsappNumber.checked) {
            if (!phoneVal || !validatePhone(phoneVal)) {
                groups.whatsappNumber.classList.add('has-error');
                isFormValid = false;
            } else {
                groups.whatsappNumber.classList.remove('has-error');
            }
        } else {
            groups.whatsappNumber.classList.remove('has-error');
        }

        // Return early or grey preview out if required fields are missing
        if (!isFormValid) {
            previewText.style.opacity = '0.5';
            waBubbleText.style.opacity = '0.5';
            whatsappLinkText.textContent = "Please fix validation errors to generate link...";
            btnOpenWa.setAttribute('disabled', 'true');
            btnOpenWa.style.opacity = '0.5';
            btnOpenWa.style.pointerEvents = 'none';
            return;
        }

        previewText.style.opacity = '1';
        waBubbleText.style.opacity = '1';
        btnOpenWa.removeAttribute('disabled');
        btnOpenWa.style.opacity = '1';
        btnOpenWa.style.pointerEvents = 'auto';

        // 2. Build Message Paragraph by Paragraph
        let introParagraph = "";
        let detailsParagraph = "";
        let payParagraph = "";
        let logisticsParagraph = "";
        let additionalParagraph = "";
        let contactParagraph = "";

        // Emojis mapping
        // Event name: 🎉, Organizer: 👥, Volunteers: 🤝, Job: 📝, Location: 📍, Date/Time: 🕒, Info: ℹ️, Incharge: 📞

        // Introduction Paragraph
        if (toggles.eventName.checked) {
            const name = fields.eventName.value.trim();
            introParagraph += `Hey everyone! 🎉 We are thrilled to invite you all to our upcoming event, *${name}*`;
            
            if (toggles.organizer.checked && fields.organizer.value.trim()) {
                const org = fields.organizer.value.trim();
                introParagraph += ` organized by *${org}*!`;
            } else {
                introParagraph += `!`;
            }
        } else if (toggles.organizer.checked && fields.organizer.value.trim()) {
            const org = fields.organizer.value.trim();
            introParagraph += `Hey everyone! 🎉 An exciting event is being organized by *${org}*!`;
        } else {
            introParagraph += `Hey everyone! 🎉 An exciting event has just been announced!`;
        }

        // Volunteers Paragraph
        const vCount = fields.volunteersCount.value;
        const jobDesc = fields.jobDescription.value.trim();

        // Gender preference formatting
        const genderVal = document.querySelector('input[name="genderRequirement"]:checked')?.value || 'ANY';
        let genderText = "";
        if (toggles.genderRequirement.checked) {
            if (genderVal === 'ONLY BOYS') {
                genderText = " (only boys)";
            } else if (genderVal === 'ONLY GIRLS') {
                genderText = " (only girls)";
            } else {
                genderText = " (open to all)";
            }
        }

        if (toggles.volunteersCount.checked && vCount) {
            detailsParagraph += `🤝 We are looking for *${vCount} volunteers${genderText}* to join our team. `;
            if (toggles.jobDescription.checked && jobDesc) {
                detailsParagraph += `As a volunteer, you will be assisting with: ${jobDesc}`;
            }
        } else if (toggles.jobDescription.checked && jobDesc) {
            detailsParagraph += `📝 *Volunteering Role${genderText}:* We need support with: ${jobDesc}`;
        } else if (toggles.genderRequirement.checked && genderText) {
            if (genderVal === 'ONLY BOYS') {
                detailsParagraph += `🤝 *Eligibility:* This volunteering opportunity is open to *boys only*. `;
            } else if (genderVal === 'ONLY GIRLS') {
                detailsParagraph += `🤝 *Eligibility:* This volunteering opportunity is open to *girls only*. `;
            } else {
                detailsParagraph += `🤝 *Eligibility:* This volunteering opportunity is open to *both boys and girls*. `;
            }
        }

        // Pay / Compensation Paragraph
        const payAmountVal = fields.payAmount.value.trim();
        const payAdditionalVal = fields.payAdditional.value.trim();

        if (toggles.payDetails.checked) {
            if (payAmountVal && payAdditionalVal) {
                payParagraph += `💰 *Compensation:* You will be paid *${payAmountVal}* for this gig, and additionally you'll receive *${payAdditionalVal}*!`;
            } else if (payAmountVal) {
                payParagraph += `💰 *Compensation:* You will be paid *${payAmountVal}* for this gig!`;
            } else if (payAdditionalVal) {
                payParagraph += `🎁 *Perks & Benefits:* While there is no direct monetary compensation, you will receive: *${payAdditionalVal}*!`;
            }
        }

        // Logistics Paragraph (Location, Date, Time)
        const locationVal = fields.location.value.trim();
        const activeDateType = document.querySelector('input[name="dateType"]:checked')?.value || 'single';
        const dateVal = fields.eventDate.value;
        const dateFromVal = fields.eventDateFrom.value;
        const dateToVal = fields.eventDateTo.value;
        
        const multipleDatesInputs = document.querySelectorAll('.multiple-date-input');
        const multipleDatesVals = Array.from(multipleDatesInputs).map(inp => inp.value);

        const hasLocation = toggles.location.checked && locationVal;
        
        let hasDate = false;
        let datePhrase = "";

        if (toggles.eventDate.checked) {
            if (activeDateType === 'single' && dateVal) {
                hasDate = true;
                datePhrase = `on *${formatDateFriendly(dateVal)}*`;
            } else if (activeDateType === 'range' && (dateFromVal || dateToVal)) {
                hasDate = true;
                datePhrase = formatDateRange(dateFromVal, dateToVal);
            } else if (activeDateType === 'multiple') {
                const formattedMulti = formatMultipleDates(multipleDatesVals);
                if (formattedMulti) {
                    hasDate = true;
                    datePhrase = formattedMulti;
                }
            }
        }

        const timeVal = fields.eventTime.value;
        const hasTime = toggles.eventTime.checked && timeVal;

        if (hasLocation || hasDate || hasTime) {
            logisticsParagraph += "📍 Join us at ";
            
            if (hasLocation) {
                logisticsParagraph += `*${locationVal}*`;
            } else {
                logisticsParagraph += "the venue";
            }

            if (hasDate && datePhrase) {
                logisticsParagraph += ` ${datePhrase}`;
            }

            if (hasTime) {
                logisticsParagraph += ` starting at *${formatTime12h(timeVal)}*`;
            }
            logisticsParagraph += ".";
        }

        // Additional Info Paragraph
        if (toggles.additionalInfo.checked && fields.additionalInfo.value.trim()) {
            additionalParagraph += `ℹ️ *Additional Info:* ${fields.additionalInfo.value.trim()}`;
        }

        // Contact Paragraph
        if (toggles.whatsappNumber.checked && phoneVal) {
            const cleanedNum = cleanPhoneNumber(phoneVal);
            contactParagraph += `📞 For any queries or to express your interest, please contact our event incharge. You can reach out directly via WhatsApp here: https://wa.me/${cleanedNum}`;
        }

        // Combine all paragraph blocks
        const paragraphs = [
            introParagraph,
            detailsParagraph,
            payParagraph,
            logisticsParagraph,
            additionalParagraph,
            contactParagraph
        ].filter(p => p.trim() !== "");

        // Join using single space/natural flow for single message paragraph or double spacing if split.
        // Prompt says: "Generate a single WhatsApp message. Use natural paragraph flow (NO bullet points)."
        // Let's separate paragraph concepts with a double newline to make it readable in chat, which is standard for WhatsApp announcements.
        generatedMessage = paragraphs.join('\n\n');

        // Update previews
        previewText.textContent = generatedMessage;
        waBubbleText.textContent = generatedMessage;
        updateMockTimestamp();

        // 3. Build Click-to-Chat Link
        if (toggles.whatsappNumber.checked && phoneVal) {
            const cleanedNum = cleanPhoneNumber(phoneVal);
            
            // Prefill text: "Hi, I'm interested in volunteering for [Event Name]!"
            let eventPart = "";
            if (toggles.eventName.checked && fields.eventName.value.trim()) {
                eventPart = ` for ${fields.eventName.value.trim()}`;
            }
            
            const prefillMsg = `Hi, I'm interested in volunteering${eventPart}!`;
            const encodedPrefill = encodeURIComponent(prefillMsg);
            
            generatedLink = `https://wa.me/${cleanedNum}?text=${encodedPrefill}`;
            whatsappLinkText.textContent = generatedLink;
        } else {
            whatsappLinkText.textContent = "WhatsApp Number toggle is OFF. Link not generated.";
            generatedLink = "";
        }
    }

    // Action: Copy Message to Clipboard
    btnCopyMsg.addEventListener('click', () => {
        if (!isFormValid) {
            showToast("Please fill in the required fields first!", false);
            return;
        }
        navigator.clipboard.writeText(generatedMessage)
            .then(() => {
                showToast("Announcement message copied!");
            })
            .catch(err => {
                showToast("Failed to copy message.", false);
                console.error("Copy failed: ", err);
            });
    });

    // Action: Copy Link to Clipboard
    btnCopyLink.addEventListener('click', () => {
        if (!isFormValid || !generatedLink) {
            showToast("No valid WhatsApp link to copy!", false);
            return;
        }
        navigator.clipboard.writeText(generatedLink)
            .then(() => {
                showToast("WhatsApp Click-to-Chat link copied!");
            })
            .catch(err => {
                showToast("Failed to copy link.", false);
                console.error("Copy failed: ", err);
            });
    });

    // Action: Open in WhatsApp
    btnOpenWa.addEventListener('click', () => {
        if (!isFormValid || !generatedLink) {
            showToast("Please provide a valid WhatsApp number!", false);
            return;
        }
        window.open(generatedLink, '_blank');
    });

    // Initial message generation
    generateAnnouncement();
});
