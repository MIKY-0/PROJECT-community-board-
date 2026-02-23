export const mockPosts = [
  {
    postId: 1,
    title: "럭키비키",
    nickname: "장원영",
    createdAt: "2025-03-31",
    viewCount: 165,
    likeCount: 12,
    commentCount: 3,
  },
  {
    postId: 2,
    title: "도와주세요",
    nickname: "카리나",
    createdAt: "2025-03-23",
    viewCount: 68,
    likeCount: 5,
    commentCount: 0,
  },
  {
    postId: 3,
    title: "잘 모르겠어요",
    nickname: "유나",
    createdAt: "2025-03-20",
    viewCount: 69,
    likeCount: 2,
    commentCount: 1,
  },
  {
    postId: 4,
    title: "프로젝트 뭐하지",
    nickname: "설윤",
    createdAt: "2025-03-16",
    viewCount: 40,
    likeCount: 1,
    commentCount: 0,
  },
  {
    postId: 5,
    title: "럭키비키",
    nickname: "장원영",
    createdAt: "2025-03-31",
    viewCount: 165,
    likeCount: 12,
    commentCount: 3,
  },
  {
    postId: 6,
    title: "도와주세요",
    nickname: "카리나",
    createdAt: "2025-03-23",
    viewCount: 68,
    likeCount: 5,
    commentCount: 0,
  },
  {
    postId: 7,
    title: "잘 모르겠어요",
    nickname: "유나",
    createdAt: "2025-03-20",
    viewCount: 69,
    likeCount: 2,
    commentCount: 1,
  },
  {
    postId: 8,
    title: "프로젝트 뭐하지",
    nickname: "설윤",
    createdAt: "2025-03-16",
    viewCount: 40,
    likeCount: 1,
    commentCount: 0,
  }
];

export const mockPostDetailsById = {
  1: { // 1번게시글
    postId: 1,
    title: "럭키비키",
    nickname: "장원영",
    createdAt: "2025-03-31",
    updatedAt: "2025-04-01",
    viewCount: 165,
    likeCount: 12,
    commentCount: 3,
    isLiked: false,
    content: "게시글 본문.프로젝트 럭키비키.",
    attachments: [ // 첨부파일
      {
        id: 1,
        fileUrl: "https://example.com/files/sample1.png",
        originalFileName: "sample1.png",
        sortOrder: 1
      }
    ],
    comments: [ // 댓글
      {
        commentId: 1,
        parentId: null,
        nickname: "카리나",
        createdAt: "2025-04-01",
        content: "1빠. 댓글고정좀",
        isDeleted: false
      },
      { // 대댓글
        commentId: 2,
        parentId: 1,
        nickname: "유나",
        createdAt: "2025-04-01",
        content: "ㄹㅇㅋㅋ",
        isDeleted: false
      },
      {
        commentId: 3,
        parentId: null,
        nickname: "설윤",
        createdAt: "2025-04-02",
        content: "",
        isDeleted: true
      }
    ]
  },

  2: {
    postId: 2,
    title: "도와주세요",
    nickname: "카리나",
    createdAt: "2025-03-23",
    updatedAt: null,
    viewCount: 68,
    likeCount: 5,
    commentCount: 0,
    isLiked: true,
    content: "도와주세요...\n무슨 프로젝트를 해야 할지 모르겠어요.",
    attachments: [],
    comments: []
  }
};

export function getMockPostDetail(postId) {
  const found = mockPostDetailsById[postId];
  if (found) return found;

  //  상세 데이터가 없으면 목록 데이터라도 기반으로 보여주기.
  const listPost = mockPosts.find( p => p.postId === postId);

  if (!listPost) {
    return {
      postId,
      title: "없는 글",
      nickname: "알수없음",
      createdAt: "-",
      updatedAt: null,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      content: "해당 게시글을 찾을 수 없습니다.",
      attachments: [],
      comments: []
    };
  }

  return {
    postId,
    title: listPost.title,
    nickname: listPost.nickname,
    createdAt: listPost.createdAt,
    updatedAt: null,
    viewCount: listPost.viewCount,
    likeCount: listPost.likeCount,
    commentCount: listPost.commentCount,
    isLiked: false,
    content: "※ 아직 상세 mock이 없는 게시글입니다.\n\n추후 API 연동 예정입니다.",
    attachments: [],
    comments: []
  };
}
