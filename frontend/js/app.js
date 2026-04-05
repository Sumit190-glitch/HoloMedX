document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8000/api/v1';
    const secureContextBanner = document.getElementById('secure-context-banner');
    const viewerModeNote = document.getElementById('viewer-mode-note');
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    const isSecureRuntime = window.isSecureContext || isLocalhost || window.location.protocol === 'https:';

    if (!isSecureRuntime) {
        if (secureContextBanner) {
            secureContextBanner.hidden = false;
        }

        if (viewerModeNote) {
            viewerModeNote.hidden = false;
        }
    }

    // --- Navigation Interactivity ---
    const navItems = document.querySelectorAll('.nav-item');
    
    // Smooth interaction for sidebar menu
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked
            this.classList.add('active');
            
            // Hide all views
            document.querySelectorAll('.view-container').forEach(view => {
                view.classList.remove('active');
            });
            
            const target = this.dataset.target;
            if (target) {
                if ((target === 'ar-overlay') && !isSecureRuntime) {
                    let fallback = document.getElementById('view-placeholder');
                    if (fallback) {
                        fallback.querySelector('.placeholder-title').textContent = 'AR Field Overlay';
                        const message = fallback.querySelector('p');
                        if (message) {
                            message.textContent = 'AR/WebXR features are disabled on HTTP hosting. Deploy this app over HTTPS to use immersive XR, or continue with the standard 3D viewer and upload flow.';
                        }
                        fallback.classList.add('active');
                    }
                    return;
                }

                // Show the targeted view
                const viewEl = document.getElementById(`view-${target}`);
                if (viewEl) {
                    viewEl.classList.add('active');
                } else {
                    // Fallback wrapper for unimplemented tabs
                    let fallback = document.getElementById('view-placeholder');
                    if (fallback) {
                        fallback.querySelector('.placeholder-title').textContent = this.querySelector('span').textContent;
                        fallback.classList.add('active');
                    }
                }
            }
        });
    });

    // --- Modal Interactivity ---
    const btnRequestReroute = document.getElementById('btn-request-reroute');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const modalReroute = document.getElementById('modal-reroute');

    function openModal() {
        modalReroute.classList.add('active');
    }

    function closeModal() {
        modalReroute.classList.remove('active');
    }

    if (btnRequestReroute) {
        btnRequestReroute.addEventListener('click', openModal);
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }

    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside of it
    modalReroute.addEventListener('click', (e) => {
        if (e.target === modalReroute) {
            closeModal();
        }
    });

    // --- Priority Button Toggle ---
    const priorityBtns = document.querySelectorAll('.priority-btn');
    priorityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            priorityBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // --- Dynamic Hover effects for Glass Panels ---
    // A subtle 3D tilt effect for main cards
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Center calculation (0 to 1)
            const xPercent = (x / rect.width - 0.5) * 2;
            const yPercent = (y / rect.height - 0.5) * 2;
            
            // Subtle rotation tilt
            card.style.transform = `perspective(1000px) rotateY(${xPercent * 2}deg) rotateX(${-yPercent * 2}deg) translateY(-2px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateY(0) rotateX(0) translateY(0)`;
        });
    });

    // --- PIPELINE DEMONSTRATION SIMULATION LOGIC ---
    const uploadInput = document.getElementById('demo-upload-input');
    const uploadStatus = document.getElementById('upload-status-text');
    const pipeElem = document.getElementById('mock-pipe');
    const canvasStatus = document.getElementById('canvas-status');
    const btnTriggerAI = document.getElementById('btn-trigger-ai');
    const btnDownloadIFC = document.getElementById('btn-download-ifc');
    const uploadedFileCard = document.getElementById('uploaded-file-card');
    const uploadedFileName = document.getElementById('uploaded-file-name');
    const uploadedFileMeta = document.getElementById('uploaded-file-meta');
    const conversionRequiredCard = document.getElementById('conversion-required-card');
    const analysisSummary = document.getElementById('analysis-summary');
    const clashResults = document.getElementById('clash-results');
    const statElements = document.getElementById('stat-elements');
    const statCritical = document.getElementById('stat-critical');
    const statMajor = document.getElementById('stat-major');
    const statReroute = document.getElementById('stat-reroute');
    const rerouteSummaryCard = document.getElementById('reroute-summary-card');
    const rerouteSummaryText = document.getElementById('reroute-summary-text');
    const rerouteStats = document.getElementById('reroute-stats');
    const rerouteCoordinates = document.getElementById('reroute-coordinates');
    const ifcViewerContainer = document.getElementById('ifc-viewer-container');

    let activeJobId = null;
    let activeFileType = null;

    function renderStats(stats) {
        if (!stats || !analysisSummary) return;
        analysisSummary.style.display = 'grid';
        statElements.textContent = stats.elements_scanned ?? 0;
        statCritical.textContent = stats.critical_clashes ?? 0;
        statMajor.textContent = stats.major_clashes ?? 0;
        statReroute.textContent = stats.reroute_candidates ?? 0;
    }

    function renderClashes(clashes) {
        if (!clashResults) return;
        clashResults.innerHTML = '';
        clashResults.style.display = clashes.length ? 'grid' : 'none';

        clashes.forEach((clash) => {
            const item = document.createElement('div');
            item.className = 'card glass-panel';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; gap:1rem; align-items:center;">
                    <div style="font-weight:700; color: var(--text-main);">${clash.element_a_id} vs ${clash.element_b_id}</div>
                    <div class="clash-status ${clash.severity === 'critical' ? 'critical' : 'warning'}">${clash.severity}</div>
                </div>
                <div style="margin-top:0.75rem; display:inline-block; padding:0.35rem 0.75rem; border-radius:999px; background:rgba(56,189,248,0.12); color: var(--primary); font-size:0.75rem; font-weight:700; text-transform:uppercase;">
                    ${clash.clash_type} clash
                </div>
                <p style="margin-top:0.9rem; color: var(--text-muted); line-height:1.5;">${clash.summary}</p>
                <div style="margin-top:0.9rem; color: var(--text-muted); font-size:0.9rem;">Clearance delta: ${clash.distance_mm} mm, required: ${clash.required_distance_mm} mm</div>
            `;
            clashResults.appendChild(item);
        });
    }

    if (uploadInput) {
        uploadInput.addEventListener('change', async function() {
            if (!(this.files && this.files.length > 0)) return;

            const file = this.files[0];
            activeFileType = file.name.toLowerCase().endsWith('.rvt') ? 'rvt' : 'ifc';
            uploadStatus.textContent = `> Uploading ${activeFileType.toUpperCase()} model to backend...`;
            canvasStatus.textContent = 'Preparing local analysis...';
            pipeElem.style.opacity = '0';
            btnTriggerAI.style.display = 'none';
            btnDownloadIFC.style.display = 'none';
            analysisSummary.style.display = 'none';
            clashResults.style.display = 'none';
            if (conversionRequiredCard) conversionRequiredCard.style.display = 'none';
            if (rerouteSummaryCard) rerouteSummaryCard.style.display = 'none';

            const formData = new FormData();
            formData.append('file', file);

            if (window.ModelViewer) {
                window.ModelViewer.resetScene();
            }

            try {
                const uploadRes = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.detail || 'Upload failed');

                activeJobId = uploadData.job_id;
                document.querySelector('.nav-item[data-target="bim-viewer"]').click();

                if (uploadedFileCard) uploadedFileCard.style.display = 'block';
                if (uploadedFileName) uploadedFileName.textContent = file.name;
                if (uploadedFileMeta) {
                    uploadedFileMeta.textContent = `Type: ${uploadData.file_type.toUpperCase()} | ${uploadData.preview_supported ? '3D preview enabled' : 'Analysis-only mode'} | Job ID: ${uploadData.job_id}`;
                }

                renderStats(uploadData.stats);
                uploadStatus.textContent = activeFileType === 'rvt'
                    ? '> RVT uploaded. Waiting for IFC/FBX conversion before real model viewing...'
                    : '> Running clash detection...';

                if (activeFileType === 'rvt') {
                    if (conversionRequiredCard) conversionRequiredCard.style.display = 'block';
                    canvasStatus.innerHTML = "<span style='color: #f59e0b;'>RVT CONVERSION REQUIRED</span> Upload the exported IFC to see the full model and actual clash locations on the web.";
                    return;
                }

                const clashRes = await fetch(`${API_URL}/detect-clashes/${uploadData.job_id}`, {
                    method: 'POST'
                });
                const clashData = await clashRes.json();
                if (!clashRes.ok) throw new Error(clashData.detail || 'Clash analysis failed');

                renderStats(clashData.stats);
                renderClashes(clashData.clashes || []);
                btnTriggerAI.style.display = clashData.clashes && clashData.clashes.length ? 'block' : 'none';

                const hasCritical = (clashData.clashes || []).some(clash => clash.severity === 'critical');
                if (hasCritical) {
                    pipeElem.style.opacity = '1';
                    pipeElem.setAttribute('stroke', '#ef4444');
                    pipeElem.setAttribute('d', 'M 200,250 L 200,50');
                    const firstClash = clashData.clashes[0];
                    const pt = firstClash.clash_point;
                    canvasStatus.innerHTML = `<span style='color: #ef4444;'>CLASH DETECTED:</span> Review hard/soft clashes below. First clash point: X=${pt.x}, Y=${pt.y}, Z=${pt.z}`;
                } else {
                    canvasStatus.innerHTML = "<span style='color: #10b981;'>NO CRITICAL CLASHES</span> Analysis completed successfully.";
                }

                if (activeFileType === 'ifc' && window.ModelViewer) {
                    await window.ModelViewer.loadIfcFromFile(file);
                    window.ModelViewer.showClashMarkers(clashData.clashes || []);
                    canvasStatus.innerHTML = "<span style='color: #38bdf8;'>IFC MODEL LOADED</span> Full model is now visible in the web viewer. Review clash cards below.";
                }
                uploadStatus.textContent = '> Analysis complete. Review clash cards below.';
            } catch (error) {
                uploadStatus.textContent = `> ${error.message}`;
                canvasStatus.innerHTML = `<span style='color: #ef4444;'>UPLOAD FAILED</span> ${error.message}`;
            }
        });
    }

    if (btnTriggerAI) {
        btnTriggerAI.addEventListener('click', async function() {
            if (!activeJobId) return;
            canvasStatus.innerHTML = "<span style='color: var(--primary);'>Executing Trimesh Solver... Constraints: Slope 1:100</span>";
            this.style.display = 'none'; // Hide AI Button

            try {
                const rerouteRes = await fetch(`${API_URL}/reroute/${activeJobId}`, {
                    method: 'POST'
                });
                const rerouteData = await rerouteRes.json();
                if (!rerouteRes.ok) throw new Error(rerouteData.detail || 'Reroute failed');

                pipeElem.setAttribute('d', 'M 200,250 L 200,160 L 120,160 L 120,80 L 200,80 L 200,50');
                pipeElem.setAttribute('stroke', '#10b981');
                pipeElem.style.opacity = '1';
                canvasStatus.innerHTML = `<span style='color: #10b981;'>100% FIXED</span> ${rerouteData.summary || 'Reroute completed successfully.'}`;
                btnDownloadIFC.style.display = 'block';
                renderStats(rerouteData.after_stats);

                if (rerouteSummaryCard) rerouteSummaryCard.style.display = 'block';
                if (rerouteSummaryText) rerouteSummaryText.textContent = rerouteData.summary || 'AABB reroute completed.';
                if (rerouteStats) {
                    rerouteStats.textContent = `Before: ${rerouteData.before_stats.critical_clashes} critical / ${rerouteData.before_stats.major_clashes} major | After: ${rerouteData.after_stats.critical_clashes} critical / ${rerouteData.after_stats.major_clashes} major`;
                }
                if (rerouteCoordinates) {
                    const coords = (rerouteData.rerouted_path || []).map((pt, index) => `Node ${index + 1}: X=${pt.x}, Y=${pt.y}, Z=${pt.z}`).join('\n');
                    rerouteCoordinates.textContent = coords;
                }

                if (window.ModelViewer && activeFileType === 'ifc') {
                    window.ModelViewer.showReroutePath(rerouteData.rerouted_path || []);
                }
            } catch (error) {
                canvasStatus.innerHTML = `<span style='color: #ef4444;'>REROUTE FAILED</span> ${error.message}`;
                this.style.display = 'block';
            }
        });
    }
});
