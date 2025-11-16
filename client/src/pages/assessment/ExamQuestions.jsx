import React, { useState, useEffect } from 'react'
import { useDataContext } from '../../context/DataContext'
import useExamQuestions from '../../hooks/useExamQuestions'
import supabase from '../../config/supabase'

export const ExamQuestions = () => {
  const { showNotification } = useDataContext()
  const {
    questions,
    loading,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    filterQuestions,
    getTopics,
  } = useExamQuestions()

  const [userId, setUserId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [topics, setTopics] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    subject: 'PJOK',
    topic: '',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    question_text: '',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ],
    correct_answer: '',
    answer_key: '',
    points: 10,
    fase: 'A',
    kelas: '1',
    tags: [],
  })

  // Get current user and load data
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        loadQuestions(user.id)
        loadTopics(user.id)
      }
    }
    getCurrentUser()
  }, [loadQuestions])

  const loadTopics = async (teacherId) => {
    const topicList = await getTopics(teacherId)
    setTopics(topicList)
  }

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question)
      setFormData({
        title: question.title,
        subject: question.subject,
        topic: question.topic,
        question_type: question.question_type,
        difficulty: question.difficulty,
        question_text: question.question_text,
        options: question.options || [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ],
        correct_answer: question.correct_answer || '',
        answer_key: question.answer_key || '',
        points: question.points,
        fase: question.fase,
        kelas: question.kelas,
        tags: question.tags || [],
      })
    } else {
      setEditingQuestion(null)
      setFormData({
        title: '',
        subject: 'PJOK',
        topic: '',
        question_type: 'multiple_choice',
        difficulty: 'medium',
        question_text: '',
        options: [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ],
        correct_answer: '',
        answer_key: '',
        points: 10,
        fase: 'A',
        kelas: '1',
        tags: [],
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingQuestion(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim() || !formData.question_text.trim()) {
      showNotification('Judul dan pertanyaan harus diisi', 'error')
      return
    }

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, formData)
        showNotification('Soal berhasil diperbarui', 'success')
      } else {
        await createQuestion(userId, formData)
        showNotification('Soal berhasil ditambahkan', 'success')
      }
      handleCloseModal()
      loadTopics(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan soal', 'error')
    }
  }

  const handleDelete = async (questionId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      return
    }

    try {
      await deleteQuestion(questionId)
      showNotification('Soal berhasil dihapus', 'success')
      loadTopics(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus soal', 'error')
    }
  }

  const handleSearch = async () => {
    if (!userId) return
    if (searchKeyword.trim()) {
      await searchQuestions(userId, searchKeyword)
    } else {
      await loadQuestions(userId)
    }
  }

  const handleFilter = async () => {
    if (!userId) return

    const filters = {}
    if (filterType) filters.question_type = filterType
    if (filterDifficulty) filters.difficulty = filterDifficulty
    if (filterTopic) filters.topic = filterTopic

    if (Object.keys(filters).length > 0) {
      await filterQuestions(userId, filters)
    } else {
      await loadQuestions(userId)
    }
  }

  const handleClearFilters = async () => {
    setSearchKeyword('')
    setFilterType('')
    setFilterDifficulty('')
    setFilterTopic('')
    if (userId) {
      await loadQuestions(userId)
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index].text = value
    setFormData({ ...formData, options: newOptions })
  }

  const addOption = () => {
    const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const nextKey = keys[formData.options.length]
    if (nextKey) {
      setFormData({
        ...formData,
        options: [...formData.options, { key: nextKey, text: '' }],
      })
    }
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const getQuestionTypeLabel = (type) => {
    const types = {
      multiple_choice: 'Pilihan Ganda',
      essay: 'Essay',
      practical: 'Praktik',
      true_false: 'Benar/Salah',
    }
    return types[type] || type
  }

  const getDifficultyLabel = (difficulty) => {
    const levels = {
      easy: 'Mudah',
      medium: 'Sedang',
      hard: 'Sulit',
    }
    return levels[difficulty] || difficulty
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    }
    return colors[difficulty] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Soal Ulangan</h1>
        <p className="text-gray-600 mt-2">
          Bank soal dan generator tes harian dengan kategorisasi
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
        >
          <i className="fas fa-plus"></i>
          Tambah Soal Baru
        </button>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Cari soal..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* Filters */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              handleFilter()
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Semua Jenis</option>
            <option value="multiple_choice">Pilihan Ganda</option>
            <option value="essay">Essay</option>
            <option value="practical">Praktik</option>
            <option value="true_false">Benar/Salah</option>
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => {
              setFilterDifficulty(e.target.value)
              handleFilter()
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Semua Tingkat</option>
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
          </select>

          <select
            value={filterTopic}
            onChange={(e) => {
              setFilterTopic(e.target.value)
              handleFilter()
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Semua Topik</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          {(searchKeyword || filterType || filterDifficulty || filterTopic) && (
            <button
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <i className="fas fa-times mr-1"></i>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat soal...</p>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-question-circle text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum ada soal
          </h3>
          <p className="text-gray-600 mb-6">
            Mulai dengan menambahkan soal pertama Anda
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i>
            Tambah Soal Baru
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Menampilkan {questions.length} soal
          </div>
          <div className="grid grid-cols-1 gap-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {question.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                          question.difficulty
                        )}`}
                      >
                        {getDifficultyLabel(question.difficulty)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-tag"></i>
                        {getQuestionTypeLabel(question.question_type)}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-book"></i>
                        {question.topic}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-star"></i>
                        {question.points} poin
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-layer-group"></i>
                        Fase {question.fase} - Kelas {question.kelas}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Hapus"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-gray-700 mb-3">{question.question_text}</p>

                  {question.question_type === 'multiple_choice' &&
                    question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-2 p-2 rounded ${
                              option.key === question.correct_answer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <span className="font-semibold text-gray-700">
                              {option.key}.
                            </span>
                            <span className="text-gray-700">{option.text}</span>
                            {option.key === question.correct_answer && (
                              <i className="fas fa-check text-green-600 ml-auto"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  {question.question_type === 'true_false' && (
                    <div className="text-sm">
                      <span className="font-semibold">Jawaban: </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          question.correct_answer === 'true'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {question.correct_answer === 'true' ? 'Benar' : 'Salah'}
                      </span>
                    </div>
                  )}

                  {(question.question_type === 'essay' ||
                    question.question_type === 'practical') &&
                    question.answer_key && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Kunci Jawaban:
                        </p>
                        <p className="text-sm text-blue-800">
                          {question.answer_key}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <form onSubmit={handleSubmit}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Soal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topik
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                      list="topics-list"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <datalist id="topics-list">
                      {topics.map((topic) => (
                        <option key={topic} value={topic} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Soal
                    </label>
                    <select
                      value={formData.question_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          question_type: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="multiple_choice">Pilihan Ganda</option>
                      <option value="essay">Essay</option>
                      <option value="practical">Praktik</option>
                      <option value="true_false">Benar/Salah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="easy">Mudah</option>
                      <option value="medium">Sedang</option>
                      <option value="hard">Sulit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fase
                    </label>
                    <select
                      value={formData.fase}
                      onChange={(e) =>
                        setFormData({ ...formData, fase: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="A">Fase A (Kelas 1-2)</option>
                      <option value="B">Fase B (Kelas 3-4)</option>
                      <option value="C">Fase C (Kelas 5-6)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelas
                    </label>
                    <select
                      value={formData.kelas}
                      onChange={(e) =>
                        setFormData({ ...formData, kelas: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="1">Kelas 1</option>
                      <option value="2">Kelas 2</option>
                      <option value="3">Kelas 3</option>
                      <option value="4">Kelas 4</option>
                      <option value="5">Kelas 5</option>
                      <option value="6">Kelas 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poin
                    </label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      min="1"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.question_text}
                    onChange={(e) =>
                      setFormData({ ...formData, question_text: e.target.value })
                    }
                    rows="4"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>

                {/* Options for Multiple Choice */}
                {formData.question_type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilihan Jawaban
                    </label>
                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 w-8">
                            {option.key}.
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                            placeholder={`Pilihan ${option.key}`}
                          />
                          {formData.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {formData.options.length < 8 && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <i className="fas fa-plus mr-1"></i>
                        Tambah Pilihan
                      </button>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jawaban Benar
                      </label>
                      <select
                        value={formData.correct_answer}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            correct_answer: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Pilih jawaban benar</option>
                        {formData.options.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.key}. {option.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* True/False */}
                {formData.question_type === 'true_false' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jawaban Benar
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="true_false"
                          value="true"
                          checked={formData.correct_answer === 'true'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              correct_answer: e.target.value,
                            })
                          }
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Benar</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="true_false"
                          value="false"
                          checked={formData.correct_answer === 'false'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              correct_answer: e.target.value,
                            })
                          }
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Salah</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Answer Key for Essay/Practical */}
                {(formData.question_type === 'essay' ||
                  formData.question_type === 'practical') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kunci Jawaban / Rubrik
                    </label>
                    <textarea
                      value={formData.answer_key}
                      onChange={(e) =>
                        setFormData({ ...formData, answer_key: e.target.value })
                      }
                      rows="4"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Masukkan kunci jawaban atau rubrik penilaian"
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {editingQuestion ? 'Perbarui Soal' : 'Simpan Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamQuestions

