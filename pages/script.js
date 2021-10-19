let sections = {};
let container = document.getElementById('result');

function applyFilters() {
	return Object
		.entries(sections)
		.filter(([name, links]) => links.length);
}

function updateResult() {
	const filtered = applyFilters();

	let total = 0;
	filtered.forEach(x => total += x[1].length);

	container.innerHTML =
		`<span>Total: ${total}</span>`
		+ filtered
			.map(([name, links]) =>
				`<h2>${name}</h2>
					<table>`
				+ links
					.map(link => link.tableRow)
					.join('\n')
				+ '</table>')
			.join('\n');
}

function parseREADME(README) {
	const regexLink = /- \[(.+)\]\((.+)\)(?: (`⚠`))? - (.+?)( \(\[.+?\))? `(.+?)` `(.+?)`/;
	const regexSection = /### (.+)\n/g;

	let res;
	while (res = regexSection.exec(README))
		sections[res[1]] = res.index;

	const entries = Object.entries(sections);
	entries.forEach(([name, fromIndex], index) =>
		sections[name] = README
			.substring(
				fromIndex,
				index < entries.length - 1
					? entries[index + 1][1]
					: README.length)
			.split('\n')
			.map(x => regexLink.exec(x))
			.filter(x => x)
			.map(x => ({
				name: x[1],
				href: x[2],
				warning: !!x[3],
				description: x[4],
				otherLinks: x[5]
					?.split(', ')
					.map(y => /.*\[(.+)\]\((.+)\)/.exec(y))
					.map(z => ({
						type: z[1],
						href: z[2]
					})) ?? [],
				licenses: x[6].split('/'),
				languages: x[7].split('/')
			}))
			.map(x => Object.assign(x, {
				tableRow: `<tr>
					<td><a href="${x.href}">${x.name}</a></td>
					<td>${x.warning ? '⚠' : ''}</td>
					<td>${x.description}</td>
					<td>${x.otherLinks.map(y => `<a href="${y.href}">${y.type}</a>`)}</td>
					<td>${x.licenses.join(', ')}</td>
					<td>${x.languages.join(', ')}</td>
				</tr>`
			})));
}

fetch('README.md')
	.then(r => r.text())
	.then(README => {
		parseREADME(README);
		updateResult();
	});
