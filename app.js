document.addEventListener('DOMContentLoaded', () => {
    // Input Fields
    const fields = {
        eventName: document.getElementById('eventName'),
        organizer: document.getElementById('organizer'),
        volunteersCount: document.getElementById('volunteersCount'),
        jobDescription: document.getElementById('jobDescription'),
        location: document.getElementById('location'),
        eventDate: document.getElementById('eventDate'),
        eventTime: document.getElementById('eventTime'),
        additionalInfo: document.getElementById('additionalInfo'),
        whatsappNumber: document.getElementById('whatsappNumber')
    };

    // Toggle Switches
    const toggles = {
        eventName: document.getElementById('toggle-eventName'),
        organizer: document.getElementById('toggle-organizer'),
        volunteersCount: document.getElementById('toggle-volunteersCount'),
        jobDescription: document.getElementById('toggle-jobDescription'),
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
        const input = fields[fieldName];

        if (toggle.checked) {
            group.classList.remove('field-disabled');
            input.removeAttribute('disabled');
        } else {
            group.classList.add('field-disabled');
            input.setAttribute('disabled', 'true');
            // Remove validation errors if disabled
            group.classList.remove('has-error');
        }
        generateAnnouncement();
    }

    // Connect all toggle switches to listeners
    Object.keys(toggles).forEach(key => {
        toggles[key].addEventListener('change', () => handleToggleState(key));
    });

    // Connect all inputs to live update listeners
    Object.keys(fields).forEach(key => {
        fields[key].addEventListener('input', generateAnnouncement);
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

        if (toggles.volunteersCount.checked && vCount) {
            detailsParagraph += `🤝 We are looking for *${vCount} volunteers* to join our team. `;
            if (toggles.jobDescription.checked && jobDesc) {
                detailsParagraph += `As a volunteer, you will be assisting with: ${jobDesc}`;
            }
        } else if (toggles.jobDescription.checked && jobDesc) {
            detailsParagraph += `📝 *Volunteering Role:* We need support with: ${jobDesc}`;
        }

        // Logistics Paragraph (Location, Date, Time)
        const locationVal = fields.location.value.trim();
        const dateVal = fields.eventDate.value;
        const timeVal = fields.eventTime.value;

        const hasLocation = toggles.location.checked && locationVal;
        const hasDate = toggles.eventDate.checked && dateVal;
        const hasTime = toggles.eventTime.checked && timeVal;

        if (hasLocation || hasDate || hasTime) {
            logisticsParagraph += "📍 Join us at ";
            
            if (hasLocation) {
                logisticsParagraph += `*${locationVal}*`;
            } else {
                logisticsParagraph += "the venue";
            }

            if (hasDate) {
                logisticsParagraph += ` on *${formatDateFriendly(dateVal)}*`;
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
