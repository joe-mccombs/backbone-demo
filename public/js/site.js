/**
 * In the interest of minimizing everything, I've included all models/views in one file.
 * For more complicated interfaces, it definitely makes sense to use templating, etc and have
 * these files in a structured file system.
 *
 * I make no use of controllers or routers in this example.
 */

/**
 * Custoemr Model
 */
var Customer = Backbone.Model.extend({
	urlRoot: 'ajax.php',
	url: function() {
		var base = this.urlRoot || (this.collection && this.collection.url) || '/';
		if (this.isNew()) {
			return base;
		}
		
		return base + '?id=' + encodeURIComponent(this.id);
	},

	defaults: {
		email: '',
		first: '',
		last: '',
		prefix: '',
		phone: '',
		fax: '',
		title: '',
		company: '',
		url: ''
	},

	validate: function(attributes) {

		if (!attributes.first.trim()) {
			return "Please enter a value for First Name."
		}

		if (!attributes.last.trim()) {
			return "Please enter a value for Last Name."
		}

		if (attributes.email) {
			var regex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
			if (! regex.test( attributes.email )) {
				return "Please enter a valid email address";
			}
		}

		if (attributes.phone) {
			//this could be refined
			var regex = /^([0-9 \+\-\(\)]){7,30}$/;
			if (! regex.test( attributes.phone )) {
				return "Please enter a valid phone number.";
			}
		}

		if (attributes.fax) {
			//this could be refined
			var regex = /^([0-9 \+\-\(\)]){7,30}$/;
			if (! regex.test( attributes.fax )) {
				return "Please enter a valid fax number.";
			}
		}

		if (attributes.url) {
			//this could be refined
			var regex = /^[a-z]{0,4}\:?\/?\/.*$/i;
			if ( regex.test( attributes.url )) {
				return "Please do not provide the protocol to the url (http assumed).";
			}
		}
	}
});



/**
 * Customer Collection
 */
var Customers = Backbone.Collection.extend({
	Model: Customer,

	url: 'ajax.php?model=customer-collection',

	sortAttribute: "last",
	sortDirection: 1,

	page: 1,
	pageRowLimit: 10,  //@todo, make this changeable by the user
	totalRecords: 0,

	parse: function(response, xhr) {
		this.totalRecords = response.count;
		this.page = response.page;

		return response.data;
	},

	sortCustomers: function (attr) {
		this.sortAttribute = attr;
		this.sort();
	},
	
	load: function() {
		this.fetch({
			data: $.param({ 
				page: this.page, 
				limit: this.pageRowLimit ,
				sortBy: this.sortAttribute,
				sortDir: this.sortDirection
			}) 
		});
	},
	
	hasPage: function() {
		return (this.pageRowLimit < this.totalRecords);
	},

	comparator: function(a, b) {
		var a = a.get(this.sortAttribute), b = b.get(this.sortAttribute);

		if (a == b) {
			return 0;
		}

		if (this.sortDirection > 0) {
			return a > b ? 1 : -1;
		} else {
			return a < b ? 1 : -1;
		}
	}
});


/**
 * Customer Table/Grid view
 */
var CustomerTable = Backbone.View.extend({

   _customerRowViews: [],

   tagName: 'table',
   className: 'data-grid',
   
   paginator: null,

   events: {
		"click th a": "headerClick"
   },

   initialize: function() {
		this.template = _.template( $('#customer-table').html() );
		this.listenTo(this.collection, "sort", this.updateTable);
		this.listenTo(this.collection, "sync", this.updatePaginator);
   },

   render: function() {
		this.$el.html( this.template() );

		this.updateTable();
		
		return this.$el;
   },
   
   headerClick: function( e ) {
		var $el = $(e.currentTarget),
			currentSort = this.collection.sortAttribute,
			newSort = $el.attr('colmap');

		//if the column sorted is the same as the current column, inverse sort direction
		this.collection.sortDirection = (newSort == currentSort)
			? this.collection.sortDirection * -1
			: 1;
			
		//Only make ajax call if we have any pages (otherwise, spare a server 
		//request and just update the DOM)
		if (this.collection.hasPage()) {
			this.collection.sortAttribute = newSort;
			this.collection.load();
		} else {
			this.collection.sortCustomers(newSort);
		}

		return false;
	},

	//remove a row on the table (only applicable for single page)
	removeItem: function(id) {
		with (this.collection) {
			totalRecords --;
			
			remove(get(id));
			this.updateTable();
			this.updatePaginator();
		}
	},

	//Update a row on the table
	updateItem: function(model) {
		this.collection.get(model.id).set(model.toJSON());
		
		//NOTE!!: If the user updated a column of the current sort, we need to
		// resort.  BUT, I left this code out because I found it confusing 
		// (sometimes the record updated would disapear into a new page)
	},

	
	updateTable: function () {
		var self = this;
		var $table = this.$('tbody');

		//add caret to the sort column. Note: dynamically removing/adding elements
		//to the DOM like this isn't ideal, but for this simple interface, it's okay
		this.$('thead').find('span').remove();
		this.$('a[colmap="' + self.collection.sortAttribute	+ '"]').append($('<span>'))
			.find('span')
			.addClass(
				'arrow-' + (self.collection.sortDirection > 0 ? 'up' : 'down')
			);

		_.invoke(this._customerRowViews, 'remove');

		this._customerRowViews = this.collection.map( function (model, i) {
			var row = new CustomerRow({
				model: new Customer(model.toJSON()),
				modal: self.options.modal,
				ref: self
			});

			$table.append(row.render().addClass(i % 2 ? 'even' : 'odd'));

			return row;
		});
	},
	
	updatePaginator: function() {
		//create the paginator element if it hasn't already been created
		if (!this.paginator) {
			this.paginator = new CustomerPaginator({collection: this.collection});
			this.$el.parent().append( this.paginator.render() );
		}
		
		this.paginator.update();
	}

});


/**
 * Customer row view (for populating table/grid)
 */
var CustomerRow = Backbone.View.extend({
	tagName: 'tr',

	events: {
		"click": "rowClick"
	},

	initialize: function() {
		var self = this;
		this.template = _.template( $('#customer-row').html() );

		this.model.on('change', function(model) {
			self.options.ref.updateItem(model);
			self.render();
		});

		this.model.on('destroy', function() {
			self.options.ref.removeItem(self.model.id);
			self.remove();
		}, this);
	},

	render: function() {
		this.$el.html( this.template( this.model.toJSON() ));

		return this.$el;
	},

	rowClick: function() {
		this.options.modal.open(this.model);

	}
});



/**
 * Paginator view
 */
var CustomerPaginator = Backbone.View.extend({
	className: 'tbl-paginator',

	events: {
		"change select": "pageChange"
	},

	initialize: function() {
		this.template = _.template( $('#customer-paginator').html() );
	},

	render: function() {
		this.$el.html( this.template() );

		return this.$el;
	},
	
	update: function() {
		var selEl = this.$('select').html('');
		
		this.$('em').html(this.collection.totalRecords);
		
		//if we don't have any pages of data, we can hide the page selector and return
		if (!this.collection.hasPage()) {
			selEl.parent().hide();
			return;
		}
		
		//When adding enough records to create it's first page, the pagination drop down 
		//will be hidden, so we need to show it.  No need to check to see if it is hidden first.
		selEl.parent().show();
	
		//create the page options
		for (var i = 1, l = Math.ceil(this.collection.totalRecords / this.collection.pageRowLimit); i <= l; i++) {
			selEl.append('<option>' + i + '</option>');
		}
		//set the select box to the current page
		selEl.val(this.collection.page);
	},

	//if the page selection selectbox changes, reload the collection
	pageChange: function() {
		this.collection.page = this.$('select').val();
		this.collection.load();
	}
});




/**
 * Modal window for modifiying customer (View)
 */
var CustomerModal = Backbone.View.extend({
	model: Customer,

	events: {
		"keydown": "keydownHandler",
		"click .btn-cancel": "close",
		"click .btn-save": "save",
		"click .btn-delete": "remove"
	},

	initialize: function() {
		var self = this;
		this.template = _.template( $('#customer-modal').html() );
	},

	setModel: function(model) {
		var self = this;
		this.model = model;
		this.model.on("invalid", function(model, error) {
			self.$el.find('.error').html(error).fadeIn('fast');
		});
	},

	render: function() {
		if (this.model.on) {
			this.$el.html( this.template( this.model.toJSON() ));
		}
		return this.$el;
	},

	keydownHandler: function( e ) {
		if( e.which == 27 ) {
			this.close();
		}
		if( e.which == 13 ) {
			this.save();
		}
	},


	close: function() {
		this.$('.pnl-form').find('input').val('');
		this.$el.find('.error').hide();
		this.$el.parent().hide();
	},

	open: function(model) {
		this.setModel(model);
		this.render();

		this.$el.parent().show();
		this.$('input:first').focus();

		if (this.model.isNew()) {
			this.$el.find('h2').html("New Customer");
			this.$el.find('.btn-delete').hide();
		}
	},

	save: function() {
		this.model.set({
			email: $('#el-email').val(),
			first: $('#el-first').val(),
			last: $('#el-last').val(),
			prefix: $('#el-prefix').val(),
			phone: $('#el-phone').val(),
			fax: $('#el-fax').val(),
			title: $('#el-title').val(),
			company: $('#el-company').val(),
			url: $('#el-url').val()
		});

		var wasNew = this.model.isNew();
		var collection = this.collection;
		
		if (this.model.save({}, {success: function() {
			//@todo: flash success message
			
			if (wasNew) {
				collection.load();
			}
		}} )) {
			this.close();
		}
		
	},

	remove: function() {
		var collection = this.collection;
		
		if (confirm('Are you sure you want to delete this contact?')) {
			//handle ajax success
			if (this.model.destroy({success: function() {
				//@todo: flash success message
				
				//If we have more than one page of data, we need to pull down more data
				//from the server.  Technically, we only need to pull down the next record, 
				//but there are instances where we need to go back to the last page and
				//re-pull all (10) rows.
				if (collection.hasPage() || collection.page > 1) {
					//if we are on a page that doesn't exist, go to the previous page
					var maxPage = Math.ceil(collection.totalRecords / collection.pageRowLimit);
					if (maxPage < collection.page) {
						collection.page --;
					}
					collection.load();
				}
			}} )) {
				//We close the modal right away to give the appearance of a snappy interface.
				//(can be risky in some cases, and we SHOULD handle ajax failures)
				this.close();
			}
		}
	}
});





/**
 * Main onload event. Sets up our interface, makes everything interactable
 */
$(function() {
	var customerList = new Customers();

	//create the modal window for CRUD use with customer
	var customerModal = new CustomerModal({collection: customerList});
	$('#modal').html( customerModal.render() );


	//attach click event to "new customer" (not very backboneish, but simple)
	$('.btn-new').click(function() {
		customerModal.open(new Customer());
	});


	//create and render the customer table
	var customerView = new CustomerTable({
		collection: customerList,
		modal: customerModal
	});
	$('#grid-customers').html( customerView.render() );

	//retrieve customer data from DB
	customerList.load();
});