const hookRegionSorter = () => {
  const regionSelect = document.getElementById("region-filter");

  if (regionSelect) {
    regionSelect.addEventListener("change", () => {
      const selectedRegion = regionSelect.value;
      const url = new URL(window.location.href);

      if (selectedRegion && selectedRegion !== "all") {
        url.searchParams.set("region", selectedRegion);
      } else {
        url.searchParams.delete("region");
      }

      window.location.href = url.toString();
    });
  }
};

const hookSeasonSorter = () => {
  const seasonSelect = document.getElementById("season-filter");

  if (seasonSelect) {
    seasonSelect.addEventListener("change", () => {
      const selectedSeason = seasonSelect.value;
      const url = new URL(window.location.href);

      if (selectedSeason && selectedSeason !== "all") {
        url.searchParams.set("season", selectedSeason);
      } else {
        url.searchParams.delete("season");
      }

      window.location.href = url.toString();
    });
  }
};

const hookTrainsCatalog = async () => {
  const listEl = document.getElementById("trains-list");
  const templateEl = document.getElementById("train-card-template");
  const loadingEl = document.getElementById("trains-loading");
  const errorEl = document.getElementById("trains-error");

  if (!listEl || !templateEl) {
    return;
  }

  try {
    const response = await fetch("/api/trains");

    if (!response.ok) {
      throw new Error(`Failed to load trains (${response.status})`);
    }

    const payload = await response.json();
    const trains = payload.trains || [];
    const fragment = document.createDocumentFragment();

    trains.forEach((train) => {
      const card = templateEl.content.cloneNode(true);
      const imageEl = card.querySelector('[data-field="image"]');

      imageEl.src = train.imageUrl;
      imageEl.alt = train.imageAlt || `${train.name} train`;

      card.querySelector('[data-field="name"]').textContent = train.name;
      card.querySelector('[data-field="operator"]').textContent =
        train.operator;
      card.querySelector('[data-field="type"]').textContent = train.type;
      card.querySelector('[data-field="speed"]').textContent =
        `${train.maxSpeedKmh} km/h`;
      card.querySelector('[data-field="seats"]').textContent =
        `${train.capacity} seats`;
      card.querySelector('[data-field="power"]').textContent =
        train.powerSource;
      card.querySelector('[data-field="description"]').textContent =
        train.description;
      card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

      fragment.appendChild(card);
    });

    listEl.replaceChildren(fragment);

    if (loadingEl) {
      loadingEl.hidden = true;
    }
  } catch (error) {
    console.error("Trains API error:", error);

    if (loadingEl) {
      loadingEl.hidden = true;
    }

    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent =
        "Unable to load trains right now. Please try again in a moment.";
    }
  }
};

const hookTripsCatalog = async () => {
  const listEl = document.getElementById("trips-list");
  const templateEl = document.getElementById("trip-card-template");
  const loadingEl = document.getElementById("trips-loading");
  const errorEl = document.getElementById("trips-error");
  const emptyEl = document.getElementById("trips-empty");

  const paginationEl = document.getElementById("trips-pagination");
  const previousBtn = document.getElementById("trips-previous");
  const nextBtn = document.getElementById("trips-next");
  const pageInfo = document.getElementById("trips-page-info");

  const regionSelect = document.getElementById("region-filter");
  const seasonSelect = document.getElementById("season-filter");

  if (!listEl || !templateEl) {
    return;
  }

  let currentPage = 1;
  const limit = 10;
  let currentTrips = [];

  const populateFilter = (select, values) => {
    if (!select) return;

    const existingValues = new Set(
      Array.from(select.options).map((option) => option.value),
    );

    values.forEach((value) => {
      if (!existingValues.has(value)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value.charAt(0).toUpperCase() + value.slice(1);

        select.appendChild(option);
      }
    });
  };

  const renderTrips = () => {
    const selectedRegion = regionSelect?.value || "all";
    const selectedSeason = seasonSelect?.value || "all";

    const filteredTrips = currentTrips.filter((trip) => {
      const matchesRegion =
        selectedRegion === "all" || trip.region === selectedRegion;

      const matchesSeason =
        selectedSeason === "all" || trip.bestSeason === selectedSeason;

      return matchesRegion && matchesSeason;
    });

    const fragment = document.createDocumentFragment();

    filteredTrips.forEach((trip) => {
      const card = templateEl.content.cloneNode(true);
      const cardEl = card.querySelector(".route-card");

      cardEl.classList.add(trip.region);

      card.querySelector('[data-field="name"]').textContent = trip.name;
      card.querySelector('[data-field="region"]').textContent = trip.region;

      card.querySelector('[data-field="startStation"]').textContent =
        trip.startStation;

      card.querySelector('[data-field="endStation"]').textContent =
        trip.endStation;

      card.querySelector('[data-field="duration"]').textContent = trip.duration;

      card.querySelector('[data-field="distance"]').textContent = trip.distance;

      const seasonEl = card.querySelector('[data-field="season"]');
      seasonEl.textContent = `Best in ${trip.bestSeason}`;
      seasonEl.classList.add(`season-${trip.bestSeason}`);

      card.querySelector('[data-field="description"]').textContent =
        trip.description;

      const highlightsEl = card.querySelector('[data-field="highlights"]');

      trip.highlights.forEach((highlight) => {
        const tag = document.createElement("span");
        tag.className = "highlight-tag";
        tag.textContent = highlight;
        highlightsEl.appendChild(tag);
      });

      card.querySelector('[data-field="details-link"]').href =
        `/trips/${trip.id}`;

      fragment.appendChild(card);
    });

    listEl.replaceChildren(fragment);

    if (emptyEl) {
      emptyEl.hidden = filteredTrips.length > 0;
    }
  };

  const loadTrips = async () => {
    try {
      if (loadingEl) {
        loadingEl.hidden = false;
      }

      if (errorEl) {
        errorEl.hidden = true;
      }

      const response = await fetch(
        `/api/trips?page=${currentPage}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to load trips (${response.status})`);
      }

      const payload = await response.json();

      currentTrips = payload.trips || [];
      const pagination = payload.pagination;

      populateFilter(
        regionSelect,
        currentTrips.map((trip) => trip.region),
      );

      populateFilter(
        seasonSelect,
        currentTrips.map((trip) => trip.bestSeason),
      );

      renderTrips();

      if (pagination) {
        paginationEl.hidden = pagination.totalPages <= 1;

        previousBtn.disabled = !pagination.hasPreviousPage;
        nextBtn.disabled = !pagination.hasNextPage;

        pageInfo.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
      }

      if (loadingEl) {
        loadingEl.hidden = true;
      }
    } catch (error) {
      console.error("Trips API error:", error);

      if (loadingEl) {
        loadingEl.hidden = true;
      }

      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent =
          "Unable to load trips right now. Please try again in a moment.";
      }
    }
  };

  regionSelect?.addEventListener("change", renderTrips);
  seasonSelect?.addEventListener("change", renderTrips);

  previousBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadTrips();
    }
  });

  nextBtn.addEventListener("click", () => {
    currentPage++;
    loadTrips();
  });

  loadTrips();
};

// Schedules catalog
const hookSchedulesCatalog = async () => {
  const listEl = document.getElementById("schedules-list");
  const templateEl = document.getElementById("schedule-card-template");
  const loadingEl = document.getElementById("schedules-loading");
  const errorEl = document.getElementById("schedules-error");

  if (!listEl || !templateEl) {
    return;
  }

  try {
    const response = await fetch("/api/schedules");

    if (!response.ok) {
      throw new Error(`Failed to load schedules (${response.status})`);
    }

    const payload = await response.json();
    const schedules = payload.schedules || [];
    const fragment = document.createDocumentFragment();

    schedules.forEach((schedule) => {
      const card = templateEl.content.cloneNode(true);

      card.querySelector('[data-field="trip"]').textContent =
        schedule.tripId.replaceAll("-", " ");

      const statusEl = card.querySelector('[data-field="status"]');
      statusEl.textContent = schedule.status ? "Active" : "Inactive";

      card.querySelector('[data-field="departure"]').textContent =
        schedule.departureTime;

      card.querySelector('[data-field="arrival"]').textContent =
        schedule.arrivalTime;

      card.querySelector('[data-field="days"]').textContent =
        schedule.daysOfWeek
          .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
          .join(", ");

      fragment.appendChild(card);
    });

    listEl.replaceChildren(fragment);

    if (loadingEl) {
      loadingEl.hidden = true;
    }
  } catch (error) {
    console.error("Schedules API error:", error);

    if (loadingEl) {
      loadingEl.hidden = true;
    }

    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent =
        "Unable to load schedules right now. Please try again in a moment.";
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  hookTrainsCatalog();
  hookTripsCatalog();
  hookSchedulesCatalog();
});
