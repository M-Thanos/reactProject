import React from 'react'

export default function Button({ name, icon }) {
    return (
        <button
            className="w-full rounded-md inline-flex items-center justify-center gap-2.5 border border-primary py-2 px-5 text-center font-medium text-white hover:bg-primary hover:bg-opacity-30 hover:text-white  lg:px-8 xl:px-5 "
        >
            <span>
                {icon}
            </span>
            {name}
        </button>
    )
}
