
const CreateProfileForm = () => {
  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Create Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your detail to create profile!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProfileForm