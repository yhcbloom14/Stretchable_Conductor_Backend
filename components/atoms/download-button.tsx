export default function DownloadButton() {
    return (
        <button className="btn px-2.5 bg-white dark:bg-gray-800 border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 text-gray-400 dark:text-gray-500">
            <span className="sr-only">Download</span><wbr />
            <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
                <path d="M16 20c.3 0 .5-.1.7-.3l5.7-5.7-1.4-1.4-4 4V8h-2v8.6l-4-4L9.6 14l5.7 5.7c.2.2.4.3.7.3zM9 22h14v2H9z" />
              </svg>
        </button>
    );
}