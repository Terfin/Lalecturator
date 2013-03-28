
var User = function(/*args*/)
{
	this.username = arguments[0];
	this.password = arguments[1];
}

var Student = function(uid, username, password, email) {
	this.uid = arguments[0];
	this.email = arguments[3];
	User.call(this, arguments[1], arguments[2]);
}

var Lecturer = function(username, password) {
	User.call(this, username, password);
}

var viewModel = function() {
	var self = this;
	self.Users = ko.observableArray([]);
	self.Lecturers = ko.computed(function () {
		return ko.utils.arrayFilter(self.Users(), function(item) {
			return item instanceof Lecturer;
		});
	});
	self.Students = ko.computed(function () {
		return ko.utils.arrayFilter(self.Users(), function(item) {
			return item instanceof Student;
		});
	});
	self.currentPage = ko.observable(0);
	self.numPages = ko.observable(0);
	self.studentsByPage = ko.observableArray();
	self.checkedRadio = ko.observable();
	self.loggedUser = ko.observable();
	self.loginObj = ko.observable();
	self.UserFormObj = ko.observable();
	self.addStudent = function addStudent () {
		resetLS();
		var valid = true;
		$('form.addStudent input[type=text]').each(function () {
			if (this.value == '')
			{
				$(this).css("border", "2px solid #FF0000");
				valid = false;
			}
			else if (this.id == "idNum" && isNaN(this.value) || !notStudent(parseInt(this.value, 10))) {
				$(this).css("border", "2px solid #FF0000");
				valid = false;
			}
			else if (this.id == "email" && (this.value.match(/@/g) == null || this.value.match(/@/g).length != 1)) {
				$(this).css("border", "2px solid #FF0000");
				valid = false;
			}
			else {
				$(this).css("border", "");
			}
		});
		if (valid) {
			self.Users.push(vm.UserFormObj());
			self.syncUserPage();
			self.UserFormObj(new Student());
		}
	}

	self.syncUserPage = function () {
		var studLen = self.Students().length;
		if ((studLen / 10) != Math.floor(studLen / 10)) {
			self.currentPage(Math.floor((studLen / 10) + 1));
			if (self.currentPage() > self.numPages()) {
				self.numPages(self.numPages() + 1);
			}
		}
		self.studentsByPage(self.Students().slice((self.currentPage() - 1) * 10));
	}

	self.saveStudent = function () {
		resetLS();
		var idx = self.Users.indexOf(self.UserFormObj());
		var user = self.Users.splice(idx, 1);
		self.Users.push(self.UserFormObj());
		self.UserFormObj(new Student());
		$('#addStud').show();
		$('#saveStud').hide();
	}

	self.editStudent = function () {
		if (self.checkedRadio() != undefined) {
		var uid = parseInt(self.checkedRadio(), 10);
		var student = this.Students().filter(function (element) {
			return element.uid == uid;
		});
		this.UserFormObj(student[0]);
		$('#addStud').hide();
		$('#saveStud').show();
		}
	}

	self.removeStudent = function () {
		if (self.checkedRadio() != undefined) {
		var uid = parseInt(self.checkedRadio(), 10);
		var student = self.Users().filter(function (element) {
			return element.uid == uid;
		});
		self.Users().splice(self.Users().indexOf(student[0]), 1);
		var lect = self.Users().splice(self.Users().indexOf(function () {
			return self.Users().filter(function (element) {
				return element instanceof Lecturer;
			})[0]}));
		self.Users.push(lect[0]);
		self.UserFormObj(new Student());
		$('#addStud').show();
		$('#saveStud').hide();
		}
	}

	self.nextPage = function () {
		self.currentPage(self.currentPage + 1);
		self.syncUserPage();
	}

	self.prevPage = function () {
		self.currentPage(self.currentPage - 1);
		self.syncUserPage();
	}
}