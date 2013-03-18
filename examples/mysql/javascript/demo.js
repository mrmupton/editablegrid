/*
 * examples/full/javascript/demo.js
 * 
 * This file is part of EditableGrid.
 * http://editablegrid.net
 *
 * Copyright (c) 2011 Webismymind SPRL
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://editablegrid.net/license
 */

// create our editable grid
var editableGrid = new EditableGrid("demo", {
	enableSort: true, // true is the default, set it to false if you don't want sorting to be enabled
	editmode: "absolute", // change this to "fixed" to test out editorzone, and to "static" to get the old-school mode
	editorzoneid: "edition", // will be used only if editmode is set to "fixed"
	pageSize: 10,
	maxBars: 10
});

// this function will initialize our editable grid
EditableGrid.prototype.initializeGrid = function() 
{
	with (this) {

		// use a special header renderer to show an info icon for some columns
		setHeaderRenderer("age", new InfoHeaderRenderer("The age must be an integer between 16 and 99"));
		setHeaderRenderer("height", new InfoHeaderRenderer("The height is given in meters"));
		if (hasColumn('continent')) setHeaderRenderer("continent", new InfoHeaderRenderer("Note that the list of proposed countries depends on the selected continent"));
		setHeaderRenderer("email", new InfoHeaderRenderer("Note the validator used automatically when you specify your column as being of type email"));
		setHeaderRenderer("freelance", new InfoHeaderRenderer("This column tells if the person works as a freelance or as an employee"));
		
		// the list of allowed countries depend on the selected continent
		if (hasColumn('continent')) {

			setEnumProvider("country", new EnumProvider({ 
			
				// the function getOptionValuesForEdit is called each time the cell is edited
				// here we do only client-side processing, but you could use Ajax here to talk with your server
				// if you do, then don't forget to use Ajax in synchronous mode 
				getOptionValuesForEdit: function (grid, column, rowIndex) {
					var continent = editableGrid.getValueAt(rowIndex, editableGrid.getColumnIndex("continent"));
					if (continent == "eu") return { "be" : "Belgique", "fr" : "France", "uk" : "Great-Britain", "nl": "Nederland"};
					else if (continent == "am") return { "br" : "Brazil", "ca": "Canada", "us" : "USA" };
					else if (continent == "af") return { "ng" : "Nigeria", "za": "South Africa", "zw" : "Zimbabwe" };
					return null;
				}
			}));
		}

		getColumn("country").cellEditor.minWidth = 105;
		
		// use a flag image to render the selected country
		setCellRenderer("country", new CellRenderer({
			render: function(cell, value) { cell.innerHTML = value ? "<img src='../../full/javascript/" + image("flags/" + value.toLowerCase() + ".png") + "' alt='" + value + "'/>" : ""; }
		})); 

		// use autocomplete on firstname
		setCellEditor("firstname", new AutocompleteCellEditor({
			suggestions: ['Leonard','Kirsten','Scott','Wayne','Stephanie','Astra','Charissa','Quin','Baxter','Jaime',
			              'Isabella','Slade','Ariana','Mohammad','Candice','Leslie','Jamal','Shay','Duncan','Neil',
			              'Kermit','Yardley','Arden','Lacy','Alisa','Selma','Scott','Natalie','Acton','Yoko','Abel',
			              'Lewis','Kellie','Shad','Joan','Ifeoma','Paloma','Jarrod','Cailin','Risa','Rylee','Giacomo',
			              'Kuame','Samuel','Ariel','Maggy','Dennis','Jocelyn','Joan','Kermit','Zorita','Tanya','Jasmine',
			              'Aquila','Jena','Dorian','Stacy','Bradley','Ulla','Sybil','Barrett','Ursa','Ignatius',
			              'Lenore','Owen','Sage','Tyrone','George','Deacon','Serina','Brian','Alden','Chadwick',
			              'Oleg','Stewart','Cynthia','Coby','Briar','Kasimir','Margaret','Lesley','Kareem','Kirestin',
			              'Zephania','Lee','Vladimir','Daryl','Henry','Amena','Camille','Dorian','Brenna','Anne','Price',
			              'Kelly','Maxine','Joseph','Illiana','Virginia','Reese','Mark', 'Paul', 'Jackie', 'Greg', 
			              'Matthew', 'Anthony', 'Claude', 'Louis', 'Marcello', 'Bernard', 'Betrand', 'Jessica', 'Patrick', 
			              'Robert', 'John', 'Jack', 'Duke', 'Denise', 'Antoine', 'Coby', 'Rana', 'Jasmine', 'André', 
			              'Martin', 'Amédé', 'Wanthus']
		}));

		// add a cell validator to check that the age is in [15, 100[
		addCellValidator("age", new CellValidator({ 
			isValid: function(value) { return value == "" || (parseInt(value) >= 16 && parseInt(value) < 100); }
		}));
		
		// register the function that will handle model changes
//		modelChanged = function(rowIndex, columnIndex, oldValue, newValue, row) { 
//			displayMessage("Value for '" + this.getColumnName(columnIndex) + "' in row " + this.getRowId(rowIndex) + " has changed from '" + oldValue + "' to '" + newValue + "'");
//			if (this.getColumnName(columnIndex) == "continent") this.setValueAt(rowIndex, this.getColumnIndex("country"), ""); // if we changed the continent, reset the country
//   	    	this.renderCharts();
//			updateCellValue(this, rowIndex, columnIndex, oldValue, newValue, row);
//		};
		
		// update paginator whenever the table is rendered (after a sort, filter, page change, etc.)
		tableRendered = function() { this.updatePaginator(); };

		// update charts when the table is sorted or filtered
		tableFiltered = function() { this.renderCharts(); };
		tableSorted = function() { this.renderCharts(); };

		rowSelected = function(oldRowIndex, newRowIndex) {
			if (oldRowIndex < 0) displayMessage("Selected row '" + this.getRowId(newRowIndex) + "'");
			else displayMessage("Selected row has changed from '" + this.getRowId(oldRowIndex) + "' to '" + this.getRowId(newRowIndex) + "'");
		};
		
		// render for the action column
		setCellRenderer("action", new CellRenderer({render: function(cell, value) {
			// this action will remove the row, so first find the ID of the row containing this cell 
			var rowId = editableGrid.getRowId(cell.rowIndex);
			
			cell.innerHTML = "<a onclick=\"if (confirm('Are you sure you want to delete this person ? ')) { editableGrid.deleteRow(" + cell.rowIndex + "); editableGrid.renderCharts(); editableGrid.remove(" + cell.rowIndex + "); } \" style=\"cursor:pointer\">" +
							 "<img src=\"" + image("delete.png") + "\" border=\"0\" alt=\"delete\" title=\"Delete row\"/></a>";
			
			cell.innerHTML+= " <a onclick=\"editableGrid.duplicateRow(" + cell.rowIndex + ");\" style=\"cursor:pointer\">" +
			 "<img src=\"" + image("duplicate.png") + "\" border=\"0\" alt=\"duplicate\" title=\"Duplicate row\"/></a>";
			
			cell.innerHTML+= " <a onclick=\"editableGrid.addRow("+cell.rowIndex+");\" style=\"cursor:pointer\">" +
			 "<img src=\"" + image("add.png") + "\" border=\"0\" alt=\"Click To Add New Row\" title=\"Add New Row\"/></a>";
			
		}})); 
		
		// render the grid (parameters will be ignored if we have attached to an existing HTML table)
		renderGrid("tablecontent", "testgrid", "tableid");
		
		// set active (stored) filter if any
		_$('filter').value = currentFilter ? currentFilter : '';
		
		// filter when something is typed into filter
		_$('filter').onkeyup = function() { editableGrid.filter(_$('filter').value); };
		
		// bind page size selector
		$("#pagesize").val(pageSize).change(function() { editableGrid.setPageSize($("#pagesize").val()); });
		$("#barcount").val(maxBars).change(function() { editableGrid.maxBars = $("#barcount").val(); editableGrid.renderCharts(); });
	}
};

// helper function to display a message
function displayMessage(text, style) { 
	_$("message").innerHTML = "<p class='" + (style || "ok") + "'>" + text + "</p>"; 
} 

// helper function to get path of a demo image
function image(relativePath) {
	return "images/" + relativePath;
}

// this will be used to render our table headers
function InfoHeaderRenderer(message) { 
	this.message = message; 
	this.infoImage = new Image();
	this.infoImage.src = image("information.png");
};

InfoHeaderRenderer.prototype = new CellRenderer();
InfoHeaderRenderer.prototype.render = function(cell, value) 
{
	if (value) {
		// here we don't use cell.innerHTML = "..." in order not to break the sorting header that has been created for us (cf. option enableSort: true)
		var link = document.createElement("a");
		link.href = "javascript:alert('" + this.message + "');";
		link.appendChild(this.infoImage);
		cell.appendChild(document.createTextNode("\u00a0\u00a0"));
		cell.appendChild(link);
	}
};

EditableGrid.prototype.onloadXML = function(url) 
{
	// register the function that will be called when the XML has been fully loaded
	this.tableLoaded = function() { 
		displayMessage("Grid loaded from XML: " + this.getRowCount() + " row(s)"); 
		this.initializeGrid();
	};

	// load XML URL
	this.loadXML(url);
};

EditableGrid.prototype.onloadJSON = function(url) 
{
	// register the function that will be called when the XML has been fully loaded
	this.tableLoaded = function() { 
		displayMessage("Grid loaded from JSON: " + this.getRowCount() + " row(s)"); 
		this.initializeGrid();
	};

	// load JSON URL
	this.loadJSON(url);
};

EditableGrid.prototype.onloadHTML = function(tableId) 
{
	// metadata are built in Javascript: we give for each column a name and a type
	this.load({ metadata: [
	    { name: "name", datatype: "string", editable: true },
	    { name: "firstname", datatype: "string", editable: true },
	    { name: "age", datatype: "integer", editable: true },
	    { name: "height", datatype: "double(m,2)", editable: true, bar: false },
	    { name: "continent", datatype: "string", editable: true, values: {"eu": "Europa", "am": "America", "af": "Africa" } },
	    { name: "country", datatype: "string", editable: true },
	    { name: "email", datatype: "email", editable: true },
	    { name: "freelance", datatype: "boolean", editable: true },
	    { name: "action", datatype: "html", editable: false }
	]});

	// we attach our grid to an existing table
	this.attachToHTMLTable(_$(tableId));
	displayMessage("Grid attached to HTML table: " + this.getRowCount() + " row(s)"); 
	
	this.initializeGrid();
};

EditableGrid.prototype.duplicate = function(rowIndex) 
{
	// copy values from given row
	var values = this.getRowValues(rowIndex);
	values['name'] = values['name'] + ' (copy)';

	// get id for new row (max id + 1)
	var newRowId = 0;
	for (var r = 0; r < this.getRowCount(); r++) newRowId = Math.max(newRowId, parseInt(this.getRowId(r)) + 1);
	
	// add new row
	this.insertAfter(rowIndex, newRowId, values); 
};

// function to render our two demo charts
EditableGrid.prototype.renderCharts = function() 
{
	this.renderBarChart("barchartcontent", 'Age per person' + (this.getRowCount() <= this.maxBars ? '' : ' (first ' + this.maxBars + ' rows out of ' + this.getRowCount() + ')'), 'name', { limit: this.maxBars, bar3d: false, rotateXLabels: this.maxBars > 10 ? 270 : 0 });
	this.renderPieChart("piechartcontent", 'Country distribution', 'country', 'country');
};

// function to render the paginator control
EditableGrid.prototype.updatePaginator = function()
{
	var paginator = $("#paginator").empty();
	var nbPages = this.getPageCount();

	// get interval
	var interval = this.getSlidingPageInterval(20);
	if (interval == null) return;
	
	// get pages in interval (with links except for the current page)
	var pages = this.getPagesInInterval(interval, function(pageIndex, isCurrent) {
		if (isCurrent) return "" + (pageIndex + 1);
		return $("<a>").css("cursor", "pointer").html(pageIndex + 1).click(function(event) { editableGrid.setPageIndex(parseInt($(this).html()) - 1); });
	});
		
	// "first" link
	var link = $("<a>").html('<img src="images/gofirst.png" />');
	if (!this.canGoBack()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { editableGrid.firstPage(); });
	paginator.append(link);

	// "prev" link
	link = $("<a>").html('<img src="images/prev.png" />');
	if (!this.canGoBack()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { editableGrid.prevPage(); });
	paginator.append(link);

	// pages
	for (p = 0; p < pages.length; p++) paginator.append(pages[p]).append(" | ");
	
	// "next" link
	link = $("<a>").html('<img src="images/next.png" />');
	if (!this.canGoForward()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { editableGrid.nextPage(); });
	paginator.append(link);

	// "last" link
	link = $("<a>").html('<img src="images/golast.png" />');
	if (!this.canGoForward()) link.css({ opacity : 0.4, filter: "alpha(opacity=40)" });
	else link.css("cursor", "pointer").click(function(event) { editableGrid.lastPage(); });
	paginator.append(link);
};
function highlightRow(rowId, bgColor, after)
{
	var rowSelector = $("#" + rowId);
	rowSelector.css("background-color", bgColor);
	rowSelector.fadeTo("normal", 0.5, function() { 
		rowSelector.fadeTo("fast", 1, function() { 
			rowSelector.css("background-color", '');
		});
	});
}

function highlight(div_id, style) {
	highlightRow(div_id, style == "error" ? "#e5afaf" : style == "warning" ? "#ffcc00" : "#8dc70a");
}
EditableGrid.prototype.modelChanged = function(rowIndex, columnIndex, oldValue, newValue, row, onResponse)
{      
	$.ajax({
		url: 'datasource/update.php',
		type: 'POST',
		dataType: "text",
		data: {
			tablename : editableGrid.name,
			id: editableGrid.getRowId(rowIndex), 
			newvalue: editableGrid.getColumnType(columnIndex) == "boolean" ? (newValue ? 1 : 0) : newValue, 
			colname: editableGrid.getColumnName(columnIndex),
			coltype: editableGrid.getColumnType(columnIndex)			
		},
		success: function (response) 
		{ 
			// reset old value if failed then highlight row
			var success = onResponse ? onResponse(response) : (response == "ok" || !isNaN(parseInt(response))); // by default, a sucessfull reponse can be "ok" or a database id 
//			if (!success) editableGrid.setValueAt(rowIndex, columnIndex, oldValue);//unnecessary with database callback showing true contents of table
		    highlight(row.id, success ? "ok" : "error");
			if (editableGrid.getColumnName(columnIndex) == "continent") editableGrid.setValueAt(rowIndex, editableGrid.getColumnIndex("country"), ""); // if we changed the continent, reset the country
			displayMessage("Value for '" + editableGrid.getColumnName(columnIndex) + "' in row" + editableGrid.getRowId(rowIndex) + " has changed from '" + oldValue + "' to '" + newValue + "'");
   	    	editableGrid.renderCharts();
			(rowIndex);

		},
		error: function(XMLHttpRequest, textStatus, exception) { alert("Ajax failure\n" + errortext); },
		async: true
	});
}   
EditableGrid.prototype.deleteRow = function (rowIndex){ 
	$.ajax({
		url: 'datasource/delete.php',
		type: 'POST',
		dataType: "text",
		data: {
			tablename : editableGrid.name,
			id: editableGrid.getRowId(rowIndex)
		},
		success: function(response){
			displayMessage("Row Has Been Deleted")
		}
	});
}
EditableGrid.prototype.duplicateRow = function(rowIndex) 
{
	var values = this.getRowValues(rowIndex); var nm = values['name']; var fn = values['firstname'];
	values['name'] = values['name'] + ' (copy)'; //values['id'] = newRowId;

	var names = []; var types = []; var vals = []; var valArr = []; valArr = callArrValues(values);
	var len = Object.keys(values).length;
	for(i=0;i<len;i++){
		var cn = editableGrid.getColumnName(i); var ct = editableGrid.getColumnType(i);
		if(cn != "id" && cn != "action"){
			names.push(cn); types.push(ct);
			switch(ct){
				case "integer": vals.push(valArr[i]); break;
				case "boolean": vals.push(valArr[i]?1:0); break;
				case "date": var dt = valArr[i]; var dtArr = dt.split("/"); 
					vals.push("STR_TO_DATE('" + dtArr[1] + '/' + dtArr[0] + '/' + dtArr[2] + "','%m/%d/%Y')"); break;
				default: vals.push("'"+valArr[i]+"'"); break;
			}
		}
	}
	$.ajax({
		url: 'datasource/insert.php',
		type: 'POST',
		dataType: "text",
		data: {
			tablename : editableGrid.name,
			columnlist: names,
			valuelist: vals	
		},
		success: function(response){
			values['id'] = response,
			editableGrid.insertAfter(rowIndex, response, values, '', true),
			displayMessage("Row Has Been added \(" + callArrValues(values) + ")")
		},
		error: function(error){ alert("Ajax Failure: "+error); }
	});
};
EditableGrid.prototype.addRow = function(rowIndex){
	var rowValues = this.getRowValues(0); 
	var colnames = []; var ev = [];
	var len = Object.keys(rowValues).length;
	for(i=0;i<len;i++){ 
		var cln = editableGrid.getColumnName(i); 
		if(cln != "id" && cln != "action"){ 
			colnames.push(cln); 
			switch(cln){
				case "name": ev.push("'Enter Last Name'"); rowValues['name'] = "Enter Last Name"; break;
				case "firstname": ev.push("'Enter First Name'"); rowValues['firstname'] = "Enter First Name"; break;
				default: ev.push("NULL"); rowValues[cln] = ''; break;
			}
		}
	}
	$.ajax({
		url: 'datasource/insert.php',
		type: 'POST',
		dataType: "text",
		data: {
			tablename : editableGrid.name,
			columnlist: colnames,
			valuelist: ev	
		},
		success: function(response){
			rowValues['id'] = response,
			editableGrid.insertAfter(rowIndex, response, rowValues, '', true),
			displayMessage("Row Has Been added")
		},
		error: function(error){ alert("Ajax Failure: "+error); }
	});
}
