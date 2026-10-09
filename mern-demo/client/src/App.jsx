import { useEffect, useState } from 'react';
import './App.css';

const readApiResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.message || `Yêu cầu thất bại (HTTP ${response.status})`);
  }

  if (data === null) {
    throw new Error('API trả về dữ liệu không hợp lệ');
  }

  return data;
};

function App() {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState(null);

  const loadStudents = async () => {
  try {
    const response = await fetch('/api/students');
    const data = await readApiResponse(response);
    setStudents(data);

  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  loadStudents();
}, []);

  const handleSubmit = async (event) => {
  event.preventDefault();

  const studentData = {
    studentId,
    name,
    email
  };

  try {

    // UPDATE
    if (editingId) {

      const response = await fetch(`/api/students/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(studentData)
        }
      );

      const result = await readApiResponse(response);

      setStudents(
        students.map((student) =>
          student._id === editingId
            ? result
            : student
        )
      );

      alert('Cập nhật thành công!');

      setEditingId(null);
    }

    // ADD
    else {

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });

      const result = await readApiResponse(response);

      setStudents([...students, result]);

      alert('Thêm sinh viên thành công!');
    }

    setStudentId('');
    setName('');
    setEmail('');

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

const handleEdit = (student) => {
  setEditingId(student._id);
  setStudentId(student.studentId);
  setName(student.name);
  setEmail(student.email);
}; 

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🎓</div>

            <div>
              <h1>Student Manager</h1>
            </div>
          </div>

          <div className="header-badge">
            ● Online
          </div>
        </div>
      </header>


      <main className="container">

        {/* PAGE TITLE */}
        <div className="page-title">
          <div>
            <h2>Quản lý sinh viên</h2>
            <p>Thêm và quản lý thông tin sinh viên</p>
          </div>
        </div>


        {/* STATISTICS */}
        <div className="stats">

          <div className="stat-card">
            <div className="stat-icon blue">
              👨‍🎓
            </div>

            <div>
              <p>Tổng sinh viên</p>
              <h3>{students.length}</h3>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <p>Trạng thái</p>
              <h3 className="active">
                Hoạt động
              </h3>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon purple">
              ☁
            </div>

            <div>
              <p>Database</p>
              <h3>MongoDB</h3>
            </div>
          </div>

        </div>


        <div className="workspace-grid">
        {/* ADD STUDENT */}
        <section className="card">

          <div className="card-header">
            <div>
              <h2>Thêm sinh viên</h2>
              <p>Nhập thông tin sinh viên mới</p>
            </div>

            <span className="card-icon">
              ＋
            </span>
          </div>
          

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  MSSV
                </label>

                <div className="input-wrapper">
                  <span>🎫</span>

                  <input
                    type="text"
                    placeholder="Ví dụ: SV001"
                    value={studentId}
                    onChange={(e) =>
                      setStudentId(e.target.value)
                    }
                    required
                  />
                </div>
              </div>


              <div className="form-group">
                <label>
                  Họ và tên
                </label>

                <div className="input-wrapper">
                  <span>👤</span>

                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />
                </div>
              </div>


              <div className="form-group full">
                <label>
                  Email
                </label>

                <div className="input-wrapper">
                  <span>✉</span>

                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

            </div>


            <div className="form-footer">

              <p>
                🔒 Thông tin được lưu vào MongoDB Atlas
              </p>

              <button type="submit">
                <span>＋</span>
                {editingId
                  ? 'Cập nhật sinh viên'
                  : 'Thêm sinh viên'}     
              </button>

            </div>

          </form>

        </section>


        {/* STUDENT LIST */}
        <section className="card student-section">

          <div className="card-header">

            <div>
              <h2>Danh sách sinh viên</h2>

              <p>
                Hiện có {students.length} sinh viên
              </p>
            </div>

            <span className="total-badge">
              {students.length}
            </span>

          </div>

          {students.length === 0 ? (

            <div className="empty">
              <div className="empty-icon">
                👨‍🎓
              </div>

              <h3>Chưa có sinh viên</h3>

              <p>
                Hãy thêm sinh viên đầu tiên của bạn.
              </p>
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>STT</th>
                    <th>MSSV</th>
                    <th>HỌ VÀ TÊN</th>
                    <th>EMAIL</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>

                <tbody>

                  {students.map((student, index) => (

                    <tr key={student._id}>

                      <td>
                        <span className="number">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>

                      <td>
                        <span className="student-id">
                          {student.studentId}
                        </span>
                      </td>

                      <td>
                        <div className="student-name">
                          <div className="avatar">
                            {student.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <span>
                            {student.name}
                          </span>
                        </div>
                      </td>

                      <td className="email">
                        {student.email}
                      </td>

                      <td>
                        <span className="status">
                          ● Đang học
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleEdit(student)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={async () => {
                            if (
                              window.confirm(
                                'Bạn có chắc chắn muốn xóa sinh viên này?'
                              )
                            ) {
                              try {
                                const response = await fetch(
                                  `/api/students/${student._id}`,
                                  {
                                    method: 'DELETE'
                                  }
                                );

                                if (!response.ok) {
                                  throw new Error(
                                    'Không thể xóa sinh viên'
                                  );
                                }

                                setStudents(
                                  students.filter(
                                    (s) =>
                                      s._id !== student._id
                                  )
                                );

                                alert('Xóa sinh viên thành công!');
                              } catch (error) {
                                console.error(error);
                                alert(error.message);
                              }
                            }
                          }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>
        </div>

      </main>


      

    </div>
  );
}

export default App;