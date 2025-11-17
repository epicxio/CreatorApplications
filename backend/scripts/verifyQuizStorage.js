const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Course = require('../src/models/Course');

const verifyQuizStorage = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}\n`);

    // Find courses with quiz lessons
    const coursesWithQuizzes = await Course.find({
      'modules.lessons.type': 'Quiz'
    }).populate('instructor', 'name');

    console.log(`📚 COURSES WITH QUIZ LESSONS: ${coursesWithQuizzes.length}\n`);

    if (coursesWithQuizzes.length === 0) {
      console.log('⚠️  No courses with quiz lessons found.\n');
    } else {
      coursesWithQuizzes.forEach(course => {
        console.log(`--- Course ID: ${course.courseId || course._id} ---`);
        console.log(`  Name: ${course.name}`);
        console.log(`  Instructor: ${course.instructor?.name || 'N/A'}`);
        
        course.modules.forEach((module, modIdx) => {
          const quizLessons = module.lessons.filter(l => l.type === 'Quiz');
          if (quizLessons.length > 0) {
            console.log(`\n  Module ${modIdx + 1}: ${module.title}`);
            quizLessons.forEach((lesson, lessonIdx) => {
              console.log(`    Quiz Lesson ${lessonIdx + 1}: ${lesson.title}`);
              if (lesson.content && lesson.content.questions) {
                console.log(`      Questions Count: ${lesson.content.questions.length}`);
                lesson.content.questions.forEach((q, qIdx) => {
                  console.log(`        Question ${qIdx + 1}:`);
                  console.log(`          Question: ${q.question}`);
                  console.log(`          Type: ${q.type}`);
                  console.log(`          Options: ${q.options?.join(', ') || 'None'}`);
                  console.log(`          Correct Answer: ${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}`);
                  console.log(`          Points: ${q.points || 10}`);
                  if (q.explanation) {
                    console.log(`          Explanation: ${q.explanation}`);
                  }
                });
              } else {
                console.log(`      ⚠️  No questions found in content`);
              }
            });
          }
        });
        console.log('\n');
      });
    }

    // Show sample structure
    console.log('\n📋 EXPECTED QUIZ QUESTION STRUCTURE IN MONGODB:');
    console.log(JSON.stringify({
      question: "What is a keyframe?",
      type: "multiple-choice",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "Option 2", // or ["Option 2", "Option 3"] for multiple choice
      explanation: "Optional explanation",
      points: 10
    }, null, 2));

    console.log('\n✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error verifying quiz storage:', error);
  } finally {
    await mongoose.disconnect();
  }
};

verifyQuizStorage();

