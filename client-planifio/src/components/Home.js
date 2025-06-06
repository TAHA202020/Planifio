import { Link } from "react-router-dom";

export default function Home()
{
    return (
        <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-6 shadow">
        <h1 className="text-2xl font-bold">TrelloClone</h1>
        <nav>
          <Link to="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded">Try it</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 bg-blue-50">
        <h2 className="text-4xl font-bold mb-4">Organize Your Projects Visually</h2>
        <p className="text-xl text-gray-600 mb-6">
          Create boards, lists, and cards with drag-and-drop. Stay on track with calendar deadlines.
        </p>
        <Link to="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700">
          Get Started
        </Link>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-12">Features</h2>

      {/* Feature 1: Image left, Text right */}
      <div className="flex flex-col md:flex-row items-center gap-12 mb-20 max-w-6xl mx-auto">
        <img
          src="https://picsum.photos/id/1018/600/400"
          alt="Boards & Lists"
          className="w-full md:w-1/2 shadow-lg"
        />
        <div className="md:w-1/2 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-4">Boards & Lists</h3>
          <p className="text-gray-600 text-lg">
            Create multiple boards to manage your projects. Organize tasks into flexible, customizable lists.
          </p>
        </div>
      </div>

      {/* Feature 2: Text left, Image right */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-20 max-w-6xl mx-auto">
        <img
          src="https://picsum.photos/id/1025/600/400"
          alt="Drag & Drop Cards"
          className="w-full md:w-1/2 shadow-lg"
        />
        <div className="md:w-1/2 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-4">Drag & Drop Cards</h3>
          <p className="text-gray-600 text-lg">
            Move tasks easily between lists with a smooth drag-and-drop interface, just like Trello.
          </p>
        </div>
      </div>

      {/* Feature 3: Image left, Text right */}
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
        <img
          src="https://picsum.photos/id/1041/600/400"
          alt="Calendar View"
          className="w-full md:w-1/2 shadow-lg"
          
        />
        <div className="md:w-1/2 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-4">Calendar View</h3>
          <p className="text-gray-600 text-lg">
            See your tasks with due dates on a full calendar view. Plan and track your deadlines visually.
          </p>
        </div>
      </div>
    </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 mt-auto text-sm text-gray-600 border-t">
        <div className="flex justify-center gap-6 mb-2">
          <a
            href="https://github.com/yourusername/trello-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            GitHub
          </a>
          <a href="mailto:tahajayche@gmail.com" className="hover:text-blue-600">
            Contact
          </a>
        </div>
      </footer>
    </div>
    )
}