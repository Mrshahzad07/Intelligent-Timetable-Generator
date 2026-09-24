// Export Utilities for College Timetable

export function exportToCSV(timetable, { divisions, rooms, faculty, subjects, config }) {
  const divisionMap = new Map(divisions.map(d => [d.id, d]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const facultyMap = new Map(faculty.map(f => [f.id, f]));
  const subjectMap = new Map(subjects.map(s => [s.id, s]));

  const headers = ['Day', 'Period Index', 'Time', 'Duration (Hours)', 'Division', 'Subject Code', 'Subject Name', 'Faculty', 'Room', 'Room Type'];
  
  const rows = timetable.map(slot => {
    const periodConf = config.periods.find(p => p.index === slot.period);
    const sub = subjectMap.get(slot.subjectId);
    const div = divisionMap.get(slot.divisionId);
    const fac = facultyMap.get(slot.facultyId);
    const rm = roomMap.get(slot.roomId);

    return [
      slot.day,
      slot.period,
      periodConf?.time || '',
      slot.duration || 1,
      `"${div?.name || slot.divisionId}"`,
      sub?.code || '',
      `"${sub?.name || ''}"`,
      `"${fac?.name || ''}"`,
      `"${rm?.name || ''}"`,
      rm?.type || ''
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `college_timetable_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `timetable_configuration_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function triggerPrint() {
  window.print();
}
