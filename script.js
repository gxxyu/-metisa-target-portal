// ===============================
// METISA TARGET PORTAL
// Website Transitions
// ===============================


// Get all main sections
const sections = document.querySelectorAll("main section");

sections.forEach((section, index) => {

    if (index % 2 === 0) {
        section.classList.add("reveal-left");
    } else {
        section.classList.add("reveal-right");
    }

    if (section.id === "home") {
        section.classList.add("active");
    }

});


// Detect when sections enter the screen
const observer = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }

        });

    },
    {
        threshold: 0.15
    }
);


// Observe every section
sections.forEach(section => {
    observer.observe(section);
});



// ===============================
// SMOOTH NAVIGATION
// ===============================

const navLinks = document.querySelectorAll("nav a");

navLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        const targetId = this.getAttribute("href");

        if (targetId.startsWith("#")) {

            const targetSection =
                document.querySelector(targetId);

            if (targetSection) {

                event.preventDefault();

                targetSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        }

    });

});



// ===============================
// ACTIVE NAVIGATION LINK
// ===============================

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 150;

        if (window.scrollY >= sectionTop) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + currentSection
        ) {

            link.classList.add("active");

        }

    });

});



// ===============================
// EXPLORE TARGETS BUTTON
// ===============================

const exploreButton =
    document.querySelector("#home button");

if (exploreButton) {

    exploreButton.addEventListener(
        "click",
        () => {

            const targets =
                document.querySelector("#targets");

            if (targets) {

                targets.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}
// =====================================
// PROTEIN EXPLORER DATA
// =====================================

let candidateData = [];


// Load candidate data from JSON
fetch("data/ranked_top100.json")
    .then(response => {

        if (!response.ok) {
            throw new Error("Could not load candidate data.");
        }

        return response.json();
    })

    .then(data => {

        candidateData = data;

        displayProteins(candidateData);
        

    })

    .catch(error => {

        console.error(error);

        document.getElementById("protein-results").innerHTML = `
            <div class="protein-placeholder">
                <div>
                    <h3>Unable to load protein data</h3>
                   <p>Please check ranked_top100.json.</p>
                </div>
            </div>
        `;

    });



// =====================================
// DISPLAY PROTEINS
// =====================================

function displayProteins(proteins) {

    const resultsContainer =
        document.getElementById("protein-results");

    resultsContainer.innerHTML = "";

    if (proteins.length === 0) {

        resultsContainer.innerHTML = `
            <div class="protein-placeholder">
                <div>
                    <h3>No proteins found</h3>
                    <p>Try a different search or filter.</p>
                </div>
            </div>
        `;

        return;
    }

    proteins.forEach(protein => {

        const card =
            document.createElement("div");

        card.className =
            "protein-placeholder";

        card.innerHTML = `

            <div>

                <span class="protein-id">
                    Rank ${protein.rank} · ${protein.protein_id}
                </span>

                <h3>
                    ${protein.gene_family}
                </h3>

                <p>
                    <strong>Function:</strong>
                    ${protein.functional_annotation}
                </p>

                <p>
                    <strong>Best Hit Species:</strong>
                    ${protein.best_hit_species}
                </p>

                <p>
                    <strong>Identity:</strong>
                    ${protein.identity_pct}%
                    &nbsp; | &nbsp;
                    <strong>Coverage:</strong>
                    ${protein.query_coverage_pct}%
                </p>

                <p>
                    <strong>Target Class:</strong>
                    ${protein.target_class}
                </p>

                <p>
                    <strong>Pfam:</strong>
                    ${protein.pfam_domains || "Not available"}
                </p>

                <p>
                    <strong>InterPro:</strong>
                    ${protein.interpro_domains || "Not available"}
                </p>

                <p>
                    <strong>Larval TPM:</strong>
                    ${Number(protein.Larva_TPM).toFixed(2)}
                </p>

            </div>

            <span class="status-badge">
                ${protein.Larva_expression}
            </span>

        `;

        resultsContainer.appendChild(card);

    });

}


// =====================================
// SEARCH AND FILTER
// =====================================

const proteinSearch =
    document.getElementById("protein-search");

const familyFilter =
    document.getElementById("family-filter");

const statusFilter =
    document.getElementById("status-filter");

const searchButton =
    document.getElementById("search-button");


function filterProteins() {

    const searchText =
        proteinSearch.value
            .toLowerCase()
            .trim();

    const selectedTargetClass =
        familyFilter.value;

    const selectedExpression =
        statusFilter.value;


    const filtered =
        candidateData.filter(protein => {

            const searchableText = `
                ${protein.rank}
                ${protein.gene_id}
                ${protein.protein_id}
                ${protein.gene_family}
                ${protein.functional_annotation}
                ${protein.best_hit_species}
                ${protein.target_class}
                ${protein.pfam_domains}
                ${protein.interpro_domains}
            `.toLowerCase();


            const matchesSearch =
                searchableText.includes(searchText);


            const matchesTargetClass =
                selectedTargetClass === "" ||
                protein.target_class === selectedTargetClass;


            const matchesExpression =
                selectedExpression === "" ||
                protein.Larva_expression === selectedExpression;


            return (
                matchesSearch &&
                matchesTargetClass &&
                matchesExpression
            );

        });


    displayProteins(filtered);

}
// Search button
searchButton.addEventListener(
    "click",
    filterProteins
);


// Search while typing
proteinSearch.addEventListener(
    "input",
    filterProteins
);


// Filters
familyFilter.addEventListener(
    "change",
    filterProteins
);

statusFilter.addEventListener(
    "change",
    filterProteins
);

// =====================================
// QC SUMMARY DATA
// =====================================

fetch("data/qc_summary.json")

    .then(response => {

        if (!response.ok) {
            throw new Error("Could not load QC summary.");
        }

        return response.json();
    })

    .then(qc => {

        const qcContainer =
            document.getElementById("qc-chart");


        qcContainer.innerHTML = `

            <div class="qc-summary-grid">

                <div class="qc-summary-item">

                    <span>Input Proteins</span>

                    <strong>
                        ${qc.input_proteins.toLocaleString()}
                    </strong>

                </div>


                <div class="qc-summary-item">

                    <span>Original BLAST Hits</span>

                    <strong>
                        ${qc.original_blast_hit_rows.toLocaleString()}
                    </strong>

                </div>


                <div class="qc-summary-item">

                    <span>Filtered BLAST Hits</span>

                    <strong>
                        ${qc.filtered_blast_hit_rows.toLocaleString()}
                    </strong>

                </div>


                <div class="qc-summary-item">

                    <span>Proteins With Filtered Hits</span>

                    <strong>
                        ${qc.unique_filtered_proteins.toLocaleString()}
                    </strong>

                </div>


                <div class="qc-summary-item">

                    <span>Arthropod</span>

                    <strong>
                        ${qc.arthropod.toLocaleString()}
                    </strong>

                </div>


                <div class="qc-summary-item">

                    <span>Bacterial</span>

                    <strong>
                        ${qc.bacterial.toLocaleString()}
                    </strong>

                </div>


                <div class="qc-summary-item">

                    <span>Fungal</span>

                    <strong>
                        ${qc.fungal.toLocaleString()}
                    </strong>

                </div>


                <div class="qc-summary-item warning">

                    <span>Flagged For Review</span>

                    <strong>
                        ${qc.flagged_for_review.toLocaleString()}
                    </strong>

                </div>

            </div>


            <p class="qc-scope-note">

                Current dashboard scope:
                <strong>${qc.scope.replace("_", " ")}</strong>

                — these are preliminary Split 4 statistics,
                not whole-project totals.

            </p>

        `;

    })

    .catch(error => {

        console.error(error);

        document.getElementById("qc-chart").innerHTML =
            "<p>Unable to load QC summary.</p>";

    });
// =====================================
// PRIORITY TARGET CARDS
// =====================================

function displayTopTargets(proteins) {

    const targetContainer =
        document.getElementById("candidate-table");

    if (!targetContainer) {
        return;
    }

    targetContainer.innerHTML = "";

    proteins.forEach(protein => {

        const card =
            document.createElement("div");

        card.className =
            "target-placeholder";

        card.innerHTML = `

            <span>
                ${String(protein.rank).padStart(2, "0")}
            </span>

            <h3>
                ${protein.gene_family}
            </h3>

            <p>
                <strong>Protein ID:</strong>
                ${protein.protein_id}
            </p>

            <p>
                <strong>Function:</strong>
                ${protein.functional_annotation}
            </p>

            <p>
                <strong>Target Class:</strong>
                ${protein.target_class}
            </p>

            <p>
                <strong>Identity:</strong>
                ${protein.identity_pct}%
            </p>

            <p>
                <strong>Coverage:</strong>
                ${protein.query_coverage_pct}%
            </p>

            <p>
                <strong>Larval TPM:</strong>
                ${Number(protein.Larva_TPM).toFixed(2)}
            </p>

            <p>
                <strong>RNAi / Chemistry:</strong>
                ${protein.rnai_or_chemistry}
            </p>

        `;

        targetContainer.appendChild(card);

    });

}

// =====================================
// LOAD FINAL TOP 10
// =====================================

fetch("data/top_targets.json")

    .then(response => {

        if (!response.ok) {
            throw new Error("Could not load final Top 10.");
        }

        return response.json();
    })

    .then(data => {

        displayTopTargets(data);

    })

    .catch(error => {

        console.error(error);

    });
