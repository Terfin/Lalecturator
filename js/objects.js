var examId = 0;

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
	self.name = ko.observable("Exam Title");
	self.id = ko.observable(++examId);
	self.questions = ko.observableArray([]);
	self.addQuestion = function () {
		self.questions.push(new Question(self.id, self.questions().length + 1));
	}
	self.selectExam = function (element) {
		console.log(element);
		if (vm.evm.selectedExam() != element)
		{
			vm.evm.selectedExam(element);
		}
	}
}

var Question = function(examId, qid) {
	var self = this;
	self.id = ko.observable(qid);
	self.text = ko.observable('Question Text');
	self.examId = examId;
	self.answers = ko.observableArray([]);
	self.activeAnswer = ko.observable();
}

var Answer = function(questionId) {
	var self = this;
	self.text = ko.observable();
	self.id = ko.observable();
	self.questionId = questionId;
	self.student = vm.loggedUser();
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
	self.evm = new examViewModel(self);
	self.resetLS = function () {
		user = lscache.get('loggedUser');
		if (user != null)
		{
			lscache.set('loggedUser', user, 15);
		}
	}
	
	self.editElement = function (element) {
		$(element).hide();
		$(element).next().show();
	}

	self.editDone = function (element) {
		$('#examSelector').buttonset('destroy');
		if (event.type == 'blur' || event.keyCode == 13 || event.keyCode == 27) 
		{
			$(element).hide();
			$(element).prev().show();
		}
		$('#examSelector').buttonset();
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
	self.Students.subscribe(function () {
		self.syncUserPage();
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
			lscache.set('students', ko.mapping.toJS(self.Students));
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
		renewButtonset('#studSelect', function () {
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
		lscache.set('students', self.Students());
	}

	

	self.editStudent = function () {
		renewButtonset('#studSelect', function () {
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
		renewButtonset('#studSelect', function () {
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
		lscache.set('students', self.Students());
	}

	self.nextPage = function () {
		renewButtonset('#studSelect', function () {
		self.currentPage(self.currentPage() + 1);
		self.studentsByPage(self.Students().slice((self.currentPage() - 1) * 10));
		});
	}

	self.prevPage = function () {
		renewButtonset('#studSelect', function () {
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

var examViewModel = function (mainVM) {
	console.log(1);
	var self = this;
	self.exams = ko.observableArray();
	var cacheExams = lscache.get('exams');
	for (exIdx in cacheExams)
	{
		self.exams.push(ko.mapping.fromJS(cacheExams[exIdx], {}, new Exam));
	}
	self.selectedExam = ko.observable();
	self.newExamSelection = ko.observable();
	if (self.exams().length > 0)
	{
		console.log('omg');
		self.newExamSelection(1);
		self.selectedExam(self.exams[0]);

	}

	
	self.newExam = function () {
		console.log(2);
		renewButtonset('#examSelector', function () {
		var exam = new Exam();
		self.selectedExam(exam);
		self.exams.push(exam);
		});
		lscache.set('exams', ko.mapping.toJS(self.exams()));
	}
	self.loadExam = function (element) {
		var exId = parseInt($(element).val(), 10);
		var exam = self.exams().filter(function (exam) {
			return (exam.id() == exId);
		});
		self.selectedExam(exam[0]);
	}
	self.newQuestion = function () {
		console.log(4);
		self.selectedExam().addQuestion();
		lscache.set('exams', self.exams());
	}
	self.loadAnswer = function (question) {
		console.log(5);
		question.answers().filter(function (answer) {
			answer.student == loggedUser
		})
	}
	ko.bindingHandlers.jqspan = {
		init: function (element, valueAccessor) {
			console.log(6);
			var ops = valueAccessor();
			renewButtonset($(element).parent().attr('id'), function() {$(element).text(ops.name())});
		},
		update: function (element, valueAccessor) {
			var ops = valueAccessor();
			console.log(element);
			$(element).children().text(ops.name());
			self.selectedExam(ops);
		}
	}
	ko.bindingHandlers.jqradio = {
		init: function (element, valueAccessor) {
			console.log(8);
			var ops = valueAccessor();
			$(element).attr('id', 'exam' + ops.id());
		},
		update: function (element, valueAccessor) {
			console.log(9);
			if(self.selectedExam() != undefined) {
				$('#exam' + self.selectedExam().id()).prop('checked', self.newExamSelection());
			}
		}
	}
}

renewButtonset = function (id, f) {
	console.log(10);
	try {
		f();
		$(id).buttonset('refresh');
	}
	catch (err) {
		f();
		$(id).buttonset();
	}
}