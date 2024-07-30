"use client";

import { addStory } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

const StoryList = ({ stories, userId }) => {
  const [storyList, setStoryList] = useState(stories);
  const [img, setImg] = useState(null);

  const { user, isLoaded } = useUser();

  const add = async () => {
    if (!img?.secure_url) return;

    addOptimisticStory({
      id: Math.random(),
      img: img.secure_url,
      createdAt: new Date(Date.now()),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userId: userId,
      user: {
        id: userId,
        username: "Sending...",
        avatar: user?.imageUrl || "/noAvatar.png",
        cover: "",
        description: "",
        name: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        createdAt: new Date(Date.now()),
      },
    });

    try {
      const createdStory = await addStory(img.secure_url);
      setStoryList((prev) => [createdStory, ...prev]);
      setImg(null);
    } catch (err) {}
  };

  const [optimisticStories, addOptimisticStory] = useState(storyList);

  const handleAddOptimisticStory = (value) => {
    addOptimisticStory((prev) => [value, ...prev]);
  };

  return (
    <>
      <CldUploadWidget
        uploadPreset="social"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => (
          <div className="flex flex-col items-center gap-2 cursor-pointer relative">
            <Image
              src={img?.secure_url || user?.imageUrl || "/noAvatar.png"}
              alt="User Avatar"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full ring-2 object-cover"
              onClick={() => open()}
            />
            {img ? (
              <form onSubmit={add}>
                <button className="text-xs bg-blue-500 p-1 rounded-md text-white">
                  Send
                </button>
              </form>
            ) : (
              <span className="font-medium">Add a Story</span>
            )}
            <div className="absolute text-6xl text-gray-200 top-1">+</div>
          </div>
        )}
      </CldUploadWidget>
      {/* STORY */}
      {optimisticStories.map((story) => (
        <div
          className="flex flex-col items-center gap-2 cursor-pointer"
          key={story.id}
        >
          <Image
            src={story.user.avatar || "/noAvatar.png"}
            alt="Story User Avatar"
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">
            {story.user.name || story.user.username}
          </span>
        </div>
      ))}
    </>
  );
};

export default StoryList;