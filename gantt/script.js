let events = []; // Initialize your event data here

function getColorByCategory(category) {
  // @TODO Abstract this to allow customization
  const categoryColors = {
    "Accompagnement projet": "#D75D75",
    "Offre de service": "#00845E",
    "Animation programme": "#7475EB",
  };
  return categoryColors[category] || "#607D8B";
}

function generateGanttChart(events) {
  const gantt = document.getElementById('gantt');
  gantt.innerHTML = ''; // Clear previous contents

  // Container for month labels
  const monthLabelsContainer = document.createElement('div');
  monthLabelsContainer.id = 'month-labels-container';
  gantt.appendChild(monthLabelsContainer);

  // Container for events
  const eventsContainer = document.createElement('div');
  eventsContainer.id = 'events-container';
  gantt.appendChild(eventsContainer);

  // New: Container for separators
  const separatorsContainer = document.createElement('div');
  separatorsContainer.id = 'separators-container';
  gantt.appendChild(separatorsContainer);

  const ganttWidth = gantt.offsetWidth;

  const sortedEvents = sortEventsByCategoryAndDate(events);

  const startDate = new Date(Math.min(...sortedEvents.map(e => new Date(e.Debut))));
  const endDate = new Date(Math.max(...sortedEvents.map(e => new Date(e.Fin))));
  const totalTime = endDate - startDate;

  generateMonthLabels(startDate, endDate, totalTime, ganttWidth, monthLabelsContainer);
  generateEventBars(sortedEvents, startDate, totalTime, ganttWidth, eventsContainer);
  generateSeparators(startDate, endDate, totalTime, ganttWidth, separatorsContainer);
}

function sortEventsByCategoryAndDate(events) {
  return events.sort((a, b) => {
    if (a.Categorie === b.Categorie) {
      return new Date(a.Debut) - new Date(b.Debut);
    }
    return a.Categorie.localeCompare(b.Categorie);
  });
}

function generateMonthLabels(startDate, endDate, totalTime, ganttWidth, container) {
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const position = ((currentDate - startDate) / totalTime) * ganttWidth;

    const monthLabel = document.createElement('div');
    monthLabel.className = 'month-label';
    monthLabel.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthLabel.style.left = `${position}px`;
    container.appendChild(monthLabel);

    if (currentDate < endDate) {
      const separator = document.createElement('div');
      separator.className = 'month-separator';
      separator.style.left = `${position}px`;
      container.appendChild(separator);
    }

    currentDate = nextMonth;
  }
}

function generateEventBars(events, startDate, totalTime, ganttWidth, container) {
  events.forEach((event, index) => {
    const start = new Date(event.Debut);
    const end = new Date(event.Fin);
    const startDay = start - startDate;
    const endDay = end - startDate;
    const duration = (endDay - startDay) / totalTime;
    const offset = startDay / totalTime;
    const barTop = 20 + 30 * index;

    if ((end - start) / (1000 * 60 * 60 * 24) <= 1) {
      const point = document.createElement('div');
      point.className = 'gantt-point';
      point.style.left = `${offset * ganttWidth}px`;
      point.style.top = `${barTop}px`;
      point.style.backgroundColor = getColorByCategory(event.Categorie);
      container.appendChild(point);

      const label = document.createElement('div');
      label.className = 'gantt-label';
      label.textContent = event.Titre;
      label.style.left = `${offset * ganttWidth + 20}px`;
      label.style.top = `${barTop}px`;
      container.appendChild(label);

    } else {
      const bar = document.createElement('div');
      bar.className = 'gantt-bar';
      bar.style.width = `${duration * ganttWidth}px`;
      bar.style.left = `${offset * ganttWidth}px`;
      bar.style.top = `${barTop}px`;
      bar.style.backgroundColor = getColorByCategory(event.Categorie);
      bar.textContent = event.Titre;
      container.appendChild(bar);
    }
  });
}

function generateSeparators(startDate, endDate, totalTime, ganttWidth, container) {
  let currentDate = new Date(startDate);
  currentDate.setDate(1); // S'assurer que nous commençons au début d'un mois

  while (currentDate <= endDate) {
    const position = ((currentDate - startDate) / totalTime) * ganttWidth;
    const separator = document.createElement('div');
    separator.className = 'month-separator';
    separator.style.left = `${position}px`;
    container.appendChild(separator);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // S'assurer que le conteneur des séparateurs a une hauteur pour rendre les séparateurs visibles
  container.style.position = 'absolute';
  container.style.height = '100%'; // Définir une hauteur pour que les séparateurs soient visibles
}

document.addEventListener('DOMContentLoaded', function () {
  generateGanttChart(events); // Make sure your events data is defined
});

// Integration with Grist data loading
grist.ready();

grist.onRecords(function (records) {
  events = records.map(record => ({
    // @TODO Abstract this to allow customization
    id: record.id,
    Titre: record.Nom_d_affichage,
    Debut: record.Debut,
    Fin: record.Fin,
    Categorie: record.Categorie
  }));
  generateGanttChart(events);
});

window.addEventListener('resize', () => {
  generateGanttChart(events);
});
