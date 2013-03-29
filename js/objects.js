
var User = function(/*args*/)
{
	var self = this;
	self.username = ko.observable(arguments[0]);
	self.password = ko.observable(arguments[1]);
}

var Student = function(/*args*/) {
	var self = this;
	self.uid = ko.observable(arguments[0]);
	self.email = ko.observable(arguments[3]);
	User.call(this, arguments[1], arguments[2]);
}

var Lecturer = function(username, password) {
	User.call(this, username, password);
}

var Exam = function() {
	var self = this;
	self.name = ko.observable();
	self.id = ko.observable();
	self.questions = ko.observableArray();
}

var Question = function() {
	var self = this;
	self.id = ko.observable();
	self.text = ko.observable();
}

var viewModel = function() {
	var self = this;
	self.Users = ko.observableArray([]);
	self.Lecturers = ko.computed(function () {
		return ko.utils.arrayFilter(self.Users(), function(item) {
			return item instanceof Lecturer;
		});
	});
	self.loggedUser = ko.observable();
	self.loginObj = ko.observable();
	self.svm = new studentViewModel(self);

	self.resetLS = function () {
		user = lscache.get('loggedUser');
		if (user != null)
		{
			lscache.set('loggedUser', user, 15);
		}
	}
}

var studentViewModel = function(mainVM) {
	var self = this;
	self.currentPage = ko.observable(0);
	self.numPages = ko.observable(0);
	self.studentsByPage = ko.observableArray();
	self.checkedRadio = ko.observable();
	self.studentFormObj = ko.observable();
	self.Students = ko.computed(function () {
		return ko.utils.arrayFilter(mainVM.Users(), function(item) {
			return item instanceof Student;
		});
	});

	self.addStudent = function () {
		mainVM.resetLS();
		var valid = true;
		$('form.addStudent input[type=text]').each(function () {
			if (this.value == '')
			{
				$(this).css("border", "2px solid #FF0000");
				valid = false;
			}
			else if (this.id == "idNum" && isNaN(this.value) || !self.notStudent(parseInt(this.value, 10))) {
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
			$('#studSelect').buttonset('destroy');
			mainVM.Users.push(self.studentFormObj());
			self.syncUserPage();
			self.studentFormObj(new Student());
			$('#studSelect').buttonset();
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
		console.log(self.Students());
		self.studentsByPage(self.Students().slice((self.currentPage() - 1) * 10));

	}

	self.saveStudent = function () {
		self.renewButtonset(function () {
			mainVM.resetLS();
			var user = self.studentFormObj().original;
			user.uid(self.studentFormObj().uid);
			user.username(self.studentFormObj().username);
			user.email(self.studentFormObj().email);
			user.password(self.studentFormObj().password);
			self.studentFormObj(new Student());
			self.syncUserPage();
			$('#addStud').show();
			$('#saveStud').hide();
		});
	}

	self.renewButtonset = function (f) {
		$('#studSelect').buttonset('destroy');
		f();
		$('#studSelect').buttonset();
	}

	self.editStudent = function () {
		self.renewButtonset(function () {
			if (self.checkedRadio() != undefined) {
			var uid = parseInt(self.checkedRadio(), 10);
			var student = self.Students().filter(function (element) {
				return element.uid() == uid;
			});
			self.studentFormObj({
				original: student[0],
				username: student[0].username(),
				uid: student[0].uid(),
				email: student[0].email(),
				password: student[0].password()
			});
			$('#addStud').hide();
			$('#saveStud').show();
			}
		});
	}

	self.removeStudent = function () {
		self.renewButtonset(function () {
		if (self.checkedRadio() != undefined) {
		var uid = parseInt(self.checkedRadio(), 10);
		var student = mainVM.Users().filter(function (element) {
			return element.uid == uid;
		});
		mainVM.Users().splice(mainVM.Users().indexOf(student[0]), 1);
		var lect = mainVM.Users().splice(mainVM.Users().indexOf(function () {
			return mainVM.Users().filter(function (element) {
				return element instanceof Lecturer;
			})[0]}));
		mainVM.Users.push(lect[0]);
		self.studentFormObj(new Student());
		self.syncUserPage();
		$('#addStud').show();
		$('#saveStud').hide();
		}
		});
	}

	self.nextPage = function () {
		self.renewButtonset(function () {
		self.currentPage(self.currentPage() + 1);
		self.studentsByPage(self.Students().slice((self.currentPage() - 1) * 10));
		});
	}

	self.prevPage = function () {
		self.renewButtonset(function () {
		self.currentPage(self.currentPage() - 1);
		self.studentsByPage(self.Students().slice((self.currentPage() - 1) * 10));
		});
	}

	self.notStudent = function (studId) {
		var student = self.Students().filter(function (elem) {
			return elem.uid() == studId;
		});
		return (student.length == 0);
	}
}

var examViewModel = function () {
	var self = this;
	self.exams = ko.observableArray();
}